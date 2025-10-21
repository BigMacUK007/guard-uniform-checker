import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCompany, getCompaniesByOwner, getCompanyById, createOfficer, getOfficersByCompany, getOfficerById, createComplianceStandard, getStandardsByCompany, getStandardById, updateComplianceStandard, createUniformCheck, getChecksByCompany, getChecksByOfficer, getCheckById, updateUniformCheck } from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Company management
  company: router({
    create: protectedProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const id = `company_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return createCompany({ id, name: input.name, ownerId: ctx.user.id });
      }),
    list: protectedProcedure.query(({ ctx }) => getCompaniesByOwner(ctx.user.id)),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getCompanyById(input.id)),
  }),

  // Officer management
  officer: router({
    create: protectedProcedure
      .input(z.object({
        companyId: z.string(),
        name: z.string(),
        email: z.string().email().optional(),
        badgeNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = `officer_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return createOfficer({ id, ...input });
      }),
    list: protectedProcedure
      .input(z.object({ companyId: z.string() }))
      .query(({ input }) => getOfficersByCompany(input.companyId)),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getOfficerById(input.id)),
  }),

  // Compliance standards management
  standard: router({
    create: protectedProcedure
      .input(z.object({
        companyId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        requirements: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const id = `standard_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return createComplianceStandard({
          id,
          companyId: input.companyId,
          name: input.name,
          description: input.description,
          requirements: JSON.stringify(input.requirements),
        });
      }),
    list: protectedProcedure
      .input(z.object({ companyId: z.string() }))
      .query(async ({ input }) => {
        const standards = await getStandardsByCompany(input.companyId);
        return standards.map(s => ({
          ...s,
          requirements: JSON.parse(s.requirements),
        }));
      }),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const standard = await getStandardById(input.id);
        if (!standard) return null;
        return {
          ...standard,
          requirements: JSON.parse(standard.requirements),
        };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        requirements: z.array(z.string()).optional(),
        isActive: z.enum(["true", "false"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        const updateData: any = { ...updates };
        if (updates.requirements) {
          updateData.requirements = JSON.stringify(updates.requirements);
        }
        await updateComplianceStandard(id, updateData);
        return { success: true };
      }),
  }),

  // Uniform checks
  check: router({
    submit: protectedProcedure
      .input(z.object({
        officerId: z.string(),
        companyId: z.string(),
        standardId: z.string(),
        imageUrl: z.string(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = `check_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return createUniformCheck({ id, ...input, status: "pending" });
      }),
    analyze: protectedProcedure
      .input(z.object({
        checkId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const check = await getCheckById(input.checkId);
        if (!check) throw new Error("Check not found");
        
        const standard = await getStandardById(check.standardId);
        if (!standard) throw new Error("Standard not found");
        
        const requirements = JSON.parse(standard.requirements);
        
        // Call AI vision model
        const prompt = `Analyze this image of a security guard and check if they are wearing the following required items: ${requirements.join(", ")}. For each item, indicate if it is present (yes/no) and provide a confidence score. Return the analysis as a JSON object with the following structure: { "items": [{ "name": "item name", "present": true/false, "confidence": 0-100 }], "overallCompliant": true/false, "notes": "any additional observations" }`;
        
        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are an AI assistant that analyzes security guard uniform compliance from images. Always respond with valid JSON." },
            { 
              role: "user", 
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: check.imageUrl } }
              ]
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "uniform_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        present: { type: "boolean" },
                        confidence: { type: "number" },
                      },
                      required: ["name", "present", "confidence"],
                      additionalProperties: false,
                    },
                  },
                  overallCompliant: { type: "boolean" },
                  notes: { type: "string" },
                },
                required: ["items", "overallCompliant", "notes"],
                additionalProperties: false,
              },
            },
          },
        });
        
        const messageContent = aiResponse.choices[0].message.content;
        const contentString = typeof messageContent === 'string' ? messageContent : '{}';
        const analysis = JSON.parse(contentString);
        const status = analysis.overallCompliant ? "compliant" : "non_compliant";
        
        await updateUniformCheck(input.checkId, {
          status,
          aiAnalysis: JSON.stringify(analysis),
        });
        
        return { success: true, analysis, status };
      }),
    listByCompany: protectedProcedure
      .input(z.object({ companyId: z.string() }))
      .query(async ({ input }) => {
        const checks = await getChecksByCompany(input.companyId);
        return checks.map(c => ({
          ...c,
          aiAnalysis: c.aiAnalysis ? JSON.parse(c.aiAnalysis) : null,
        }));
      }),
    listByOfficer: protectedProcedure
      .input(z.object({ officerId: z.string() }))
      .query(async ({ input }) => {
        const checks = await getChecksByOfficer(input.officerId);
        return checks.map(c => ({
          ...c,
          aiAnalysis: c.aiAnalysis ? JSON.parse(c.aiAnalysis) : null,
        }));
      }),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const check = await getCheckById(input.id);
        if (!check) return null;
        return {
          ...check,
          aiAnalysis: check.aiAnalysis ? JSON.parse(check.aiAnalysis) : null,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
