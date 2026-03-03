import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddPatientFormProps {
  onPatientAdded?: () => void;
}

interface PatientFormData {
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  primaryDiagnosis: string;
  secondaryDiagnoses: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
}

const initialFormData: PatientFormData = {
  mrn: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  phone: "",
  primaryDiagnosis: "",
  secondaryDiagnoses: "",
  address: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  emergencyContact: {
    name: "",
    relationship: "",
    phone: "",
  },
  insuranceInfo: {
    provider: "",
    policyNumber: "",
    groupNumber: "",
  },
};

export function AddPatientForm({ onPatientAdded }: AddPatientFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [section, subField] = field.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section as keyof PatientFormData] as any,
            [subField]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.mrn || !formData.firstName || !formData.lastName || !formData.dateOfBirth) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (MRN, First Name, Last Name, Date of Birth)",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for insertion
      const patientData = {
        mrn: formData.mrn,
        first_name: formData.firstName,
        last_name: formData.lastName,
        date_of_birth: formData.dateOfBirth,
        phone: formData.phone || null,
        primary_diagnosis: formData.primaryDiagnosis || null,
        secondary_diagnoses: formData.secondaryDiagnoses 
          ? formData.secondaryDiagnoses.split(',').map(d => d.trim()).filter(d => d)
          : null,
        address: formData.address.street || formData.address.city || formData.address.state || formData.address.zipCode
          ? formData.address
          : null,
        emergency_contact: formData.emergencyContact.name || formData.emergencyContact.phone
          ? formData.emergencyContact
          : null,
        insurance_info: formData.insuranceInfo.provider || formData.insuranceInfo.policyNumber
          ? formData.insuranceInfo
          : null,
      };

      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();

      if (error) {
        console.error('Error creating patient:', error);
        toast({
          title: "Error",
          description: "Failed to create patient record. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Patient ${formData.firstName} ${formData.lastName} has been created successfully.`,
      });

      // Reset form and close dialog
      setFormData(initialFormData);
      setOpen(false);
      onPatientAdded?.();

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add New Patient
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mrn">Medical Record Number *</Label>
                  <Input
                    id="mrn"
                    value={formData.mrn}
                    onChange={(e) => updateFormData('mrn', e.target.value)}
                    placeholder="MRN-123456"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primaryDiagnosis">Primary Diagnosis</Label>
                <Input
                  id="primaryDiagnosis"
                  value={formData.primaryDiagnosis}
                  onChange={(e) => updateFormData('primaryDiagnosis', e.target.value)}
                  placeholder="e.g., Type 2 Diabetes Mellitus"
                />
              </div>

              <div>
                <Label htmlFor="secondaryDiagnoses">Secondary Diagnoses</Label>
                <Textarea
                  id="secondaryDiagnoses"
                  value={formData.secondaryDiagnoses}
                  onChange={(e) => updateFormData('secondaryDiagnoses', e.target.value)}
                  placeholder="Enter multiple diagnoses separated by commas"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => updateFormData('address.street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => updateFormData('address.state', e.target.value)}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => updateFormData('address.zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => updateFormData('emergencyContact.name', e.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => updateFormData('emergencyContact.relationship', e.target.value)}
                    placeholder="Spouse, Child, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyPhone">Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => updateFormData('emergencyContact.phone', e.target.value)}
                  placeholder="(555) 987-6543"
                />
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={formData.insuranceInfo.provider}
                  onChange={(e) => updateFormData('insuranceInfo.provider', e.target.value)}
                  placeholder="Blue Cross Blue Shield"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    id="policyNumber"
                    value={formData.insuranceInfo.policyNumber}
                    onChange={(e) => updateFormData('insuranceInfo.policyNumber', e.target.value)}
                    placeholder="ABC123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="groupNumber">Group Number</Label>
                  <Input
                    id="groupNumber"
                    value={formData.insuranceInfo.groupNumber}
                    onChange={(e) => updateFormData('insuranceInfo.groupNumber', e.target.value)}
                    placeholder="GRP-001"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}