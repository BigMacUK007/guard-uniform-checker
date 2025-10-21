import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Settings2, X } from "lucide-react";
import { toast } from "sonner";

export default function Standards() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [formData, setFormData] = useState({
    companyId: "",
    name: "",
    description: "",
    requirements: [] as string[],
  });
  const [currentRequirement, setCurrentRequirement] = useState("");
  
  const utils = trpc.useUtils();
  const { data: companies } = trpc.company.list.useQuery();
  const { data: standards, isLoading } = trpc.standard.list.useQuery(
    { companyId: selectedCompanyId },
    { enabled: !!selectedCompanyId }
  );
  
  const createStandard = trpc.standard.create.useMutation({
    onSuccess: () => {
      utils.standard.list.invalidate();
      setIsDialogOpen(false);
      setFormData({ companyId: "", name: "", description: "", requirements: [] });
      toast.success("Standard created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create standard: ${error.message}`);
    },
  });

  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const handleAddRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, currentRequirement.trim()],
      });
      setCurrentRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.companyId || formData.requirements.length === 0) {
      toast.error("Company, name, and at least one requirement are required");
      return;
    }
    createStandard.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Standards</h1>
            <p className="text-muted-foreground mt-2">
              Define uniform requirements for your security officers
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Standard
          </Button>
        </div>

        {companies && companies.length > 0 && (
          <div className="flex items-center gap-4">
            <Label htmlFor="company-filter">Filter by Company:</Label>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!companies || companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
              <p className="text-sm text-muted-foreground">
                Please create a company first before defining standards
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : standards && standards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {standards.map((standard) => (
              <Card key={standard.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{standard.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {standard.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <Badge variant={standard.isActive === "true" ? "default" : "secondary"}>
                      {standard.isActive === "true" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Required Items:</h4>
                      <div className="flex flex-wrap gap-2">
                        {standard.requirements.map((req: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No standards yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first compliance standard to define uniform requirements
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Standard
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create Compliance Standard</DialogTitle>
                <DialogDescription>
                  Define the uniform requirements for your security officers
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Standard Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Standard Uniform Requirements"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this compliance standard"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Required Items *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Hi-vis vest, Body-worn camera, SIA badge"
                      value={currentRequirement}
                      onChange={(e) => setCurrentRequirement(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddRequirement();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddRequirement}>
                      Add
                    </Button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.requirements.map((req, idx) => (
                        <Badge key={idx} variant="secondary" className="gap-1">
                          {req}
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idx)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createStandard.isPending}>
                  {createStandard.isPending ? "Creating..." : "Create Standard"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

