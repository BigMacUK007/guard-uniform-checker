import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Camera, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { storagePut } from "@/lib/storage";

export default function Checks() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [formData, setFormData] = useState({
    officerId: "",
    companyId: "",
    standardId: "",
    location: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  const { data: companies } = trpc.company.list.useQuery();
  const { data: officers } = trpc.officer.list.useQuery(
    { companyId: formData.companyId },
    { enabled: !!formData.companyId }
  );
  const { data: standards } = trpc.standard.list.useQuery(
    { companyId: formData.companyId },
    { enabled: !!formData.companyId }
  );
  const { data: checks, isLoading } = trpc.check.listByCompany.useQuery(
    { companyId: selectedCompanyId },
    { enabled: !!selectedCompanyId }
  );
  
  const submitCheck = trpc.check.submit.useMutation({
    onSuccess: async (data) => {
      // Trigger AI analysis
      analyzeCheck.mutate({ checkId: data.id });
    },
    onError: (error) => {
      toast.error(`Failed to submit check: ${error.message}`);
      setIsUploading(false);
    },
  });

  const analyzeCheck = trpc.check.analyze.useMutation({
    onSuccess: () => {
      utils.check.listByCompany.invalidate();
      setIsDialogOpen(false);
      setFormData({ officerId: "", companyId: "", standardId: "", location: "" });
      setImageFile(null);
      setImagePreview("");
      setIsUploading(false);
      toast.success("Check submitted and analyzed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to analyze check: ${error.message}`);
      setIsUploading(false);
    },
  });

  useEffect(() => {
    if (companies && companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.officerId || !formData.companyId || !formData.standardId || !imageFile) {
      toast.error("All fields and an image are required");
      return;
    }

    setIsUploading(true);
    try {
      // Upload image to S3
      const imageBuffer = await imageFile.arrayBuffer();
      const { url: imageUrl } = await storagePut(
        `uniform-checks/${Date.now()}-${imageFile.name}`,
        new Uint8Array(imageBuffer),
        imageFile.type
      );

      // Submit check
      submitCheck.mutate({
        ...formData,
        imageUrl,
      });
    } catch (error) {
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "non_compliant":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge className="bg-green-600">Compliant</Badge>;
      case "non_compliant":
        return <Badge className="bg-red-600">Non-Compliant</Badge>;
      default:
        return <Badge className="bg-yellow-600">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Uniform Checks</h1>
            <p className="text-muted-foreground mt-2">
              View and submit uniform compliance checks
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Check
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
              <Camera className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
              <p className="text-sm text-muted-foreground">
                Please create a company first before submitting checks
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ) : checks && checks.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-medium">{check.officerId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(check.status)}
                        {getStatusBadge(check.status)}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(check.submittedAt!).toLocaleString()}</TableCell>
                    <TableCell>{check.location || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No checks yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit your first uniform check to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Submit Check
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <form onSubmit={handleSubmit} className="flex flex-col max-h-[90vh]">
              <div className="px-6 pt-6">
                <DialogHeader>
                  <DialogTitle>Submit Uniform Check</DialogTitle>
                  <DialogDescription>
                    Upload a photo for AI-powered compliance verification
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="grid gap-4 px-6 py-4 overflow-y-auto flex-1">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company *</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => setFormData({ ...formData, companyId: value, officerId: "", standardId: "" })}
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
                  <Label htmlFor="officer">Officer *</Label>
                  <Select
                    value={formData.officerId}
                    onValueChange={(value) => setFormData({ ...formData, officerId: value })}
                    disabled={!formData.companyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an officer" />
                    </SelectTrigger>
                    <SelectContent>
                      {officers?.map((officer) => (
                        <SelectItem key={officer.id} value={officer.id}>
                          {officer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="standard">Compliance Standard *</Label>
                  <Select
                    value={formData.standardId}
                    onValueChange={(value) => setFormData({ ...formData, standardId: value })}
                    disabled={!formData.companyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a standard" />
                    </SelectTrigger>
                    <SelectContent>
                      {standards?.map((standard) => (
                        <SelectItem key={standard.id} value={standard.id}>
                          {standard.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location (Optional)</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main entrance, Building A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Photo *</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {imageFile ? "Change Photo" : "Take/Upload Photo"}
                  </Button>
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-64 object-contain rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 pb-6 border-t pt-4">
                <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Submitting..." : "Submit & Analyze"}
                </Button>
              </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

