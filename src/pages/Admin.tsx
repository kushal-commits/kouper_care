import { useState, useEffect } from "react";
import { 
  Users, 
  Settings, 
  Shield, 
  Palette, 
  Plus, 
  Mail, 
  Webhook,
  Database,
  AlertTriangle,
  Lock,
  Eye,
  Trash2,
  Download,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { KeywordsManager } from "@/components/KeywordsManager";

// Mock data
const users = [
  {
    id: "1",
    name: "Dr. Sarah Smith",
    email: "sarah.smith@hospital.com",
    role: "Clinician",
    status: "Active",
    lastLogin: "2024-01-28"
  },
  {
    id: "2", 
    name: "Nurse Johnson",
    email: "nurse.johnson@hospital.com",
    role: "Coordinator",
    status: "Active",
    lastLogin: "2024-01-27"
  },
  {
    id: "3",
    name: "Dr. Wilson",
    email: "dr.wilson@hospital.com", 
    role: "QA",
    status: "Inactive",
    lastLogin: "2024-01-20"
  },
  {
    id: "4",
    name: "Mike Thompson",
    email: "mike.thompson@hospital.com",
    role: "PT",
    status: "Active",
    lastLogin: "2024-01-28"
  },
  {
    id: "5",
    name: "Lisa Rodriguez",
    email: "lisa.rodriguez@hospital.com",
    role: "OT",
    status: "Active",
    lastLogin: "2024-01-29"
  }
];

type AlertRule = {
  id: string;
  name: string;
  condition: string;
  severity: string;
  window_size: string;
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function Admin() {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Clinician");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [isNewRuleOpen, setIsNewRuleOpen] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleCondition, setNewRuleCondition] = useState("");
  const [newRuleSeverity, setNewRuleSeverity] = useState("medium");
  const [newRuleWindowSize, setNewRuleWindowSize] = useState("");
  const [isEditRuleOpen, setIsEditRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [editRuleName, setEditRuleName] = useState("");
  const [editRuleCondition, setEditRuleCondition] = useState("");
  const [editRuleSeverity, setEditRuleSeverity] = useState("medium");
  const [editRuleWindowSize, setEditRuleWindowSize] = useState("");
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [isProcessingNL, setIsProcessingNL] = useState(false);
  const { toast } = useToast();

  // Load alert rules from database
  useEffect(() => {
    loadAlertRules();
  }, []);

  const loadAlertRules = async () => {
    console.log('Loading alert rules...');
    try {
      const { data, error } = await supabase
        .from('alert_rules')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Alert rules response:', { data, error });
      
      if (error) throw error;
      
      console.log('Setting alert rules:', data);
      setAlertRules(data || []);
      
    } catch (error) {
      console.error('Error loading alert rules:', error);
      toast({
        title: "Error",
        description: "Failed to load alert rules",
        variant: "destructive"
      });
    }
  };

  const createAlertRule = async () => {
    if (!newRuleName || !newRuleCondition || !newRuleWindowSize) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('alert_rules')
        .insert({
          name: newRuleName,
          condition: newRuleCondition,
          severity: newRuleSeverity,
          window_size: newRuleWindowSize,
          enabled: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert rule created successfully"
      });

      // Reset form and reload rules
      setNewRuleName("");
      setNewRuleCondition("");
      setNewRuleSeverity("medium");
      setNewRuleWindowSize("");
      setIsNewRuleOpen(false);
      loadAlertRules();
    } catch (error) {
      console.error('Error creating alert rule:', error);
      toast({
        title: "Error",
        description: "Failed to create alert rule",
        variant: "destructive"
      });
    }
  };

  const toggleAlertRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({ enabled: !currentStatus })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert rule ${!currentStatus ? 'enabled' : 'disabled'} successfully`
      });

      // Reload rules to reflect changes
      loadAlertRules();
    } catch (error) {
      console.error('Error updating alert rule:', error);
      toast({
        title: "Error",
        description: "Failed to update alert rule",
        variant: "destructive"
      });
    }
  };

  const openEditRule = (rule: AlertRule) => {
    setEditingRule(rule);
    setEditRuleName(rule.name);
    setEditRuleCondition(rule.condition);
    setEditRuleSeverity(rule.severity);
    setEditRuleWindowSize(rule.window_size);
    setIsEditRuleOpen(true);
  };

  const updateAlertRule = async () => {
    if (!editingRule || !editRuleName || !editRuleCondition || !editRuleWindowSize) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('alert_rules')
        .update({
          name: editRuleName,
          condition: editRuleCondition,
          severity: editRuleSeverity,
          window_size: editRuleWindowSize
        })
        .eq('id', editingRule.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Alert rule updated successfully"
      });

      // Reset form and reload rules
      setEditingRule(null);
      setEditRuleName("");
      setEditRuleCondition("");
      setEditRuleSeverity("medium");
      setEditRuleWindowSize("");
      setIsEditRuleOpen(false);
      loadAlertRules();
    } catch (error) {
      console.error('Error updating alert rule:', error);
      toast({
        title: "Error",
        description: "Failed to update alert rule",
        variant: "destructive"
      });
    }
  };

  const processNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe the alert rule you want to create",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingNL(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-rule-language', {
        body: { naturalLanguage: naturalLanguageInput }
      });

      if (error) throw error;

      if (data.success) {
        const rule = data.rule;
        setNewRuleName(rule.name);
        setNewRuleCondition(rule.condition);
        setNewRuleSeverity(rule.severity);
        setNewRuleWindowSize(rule.window_size);
        setNaturalLanguageInput("");
        
        toast({
          title: "Rule Generated",
          description: "Alert rule has been generated from your description. Review and create it.",
        });
      } else {
        throw new Error(data.error || 'Failed to process natural language');
      }
    } catch (error) {
      console.error('Error processing natural language:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process natural language input. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingNL(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return <Badge variant="destructive">{role}</Badge>;
      case "QA":
        return <Badge className="bg-blue-100 text-blue-800">{role}</Badge>;
      case "Coordinator":
        return <Badge className="bg-green-100 text-green-800">{role}</Badge>;
      case "Clinician":
        return <Badge variant="secondary">{role}</Badge>;
      case "PT":
        return <Badge className="bg-purple-100 text-purple-800">{role}</Badge>;
      case "OT":
        return <Badge className="bg-orange-100 text-orange-800">{role}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" 
      ? <Badge className="bg-green-100 text-green-800">{status}</Badge>
      : <Badge variant="outline">{status}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return <Badge variant="destructive">{severity.charAt(0).toUpperCase() + severity.slice(1)}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">{severity.charAt(0).toUpperCase() + severity.slice(1)}</Badge>;
      default:
        return <Badge variant="outline">{severity.charAt(0).toUpperCase() + severity.slice(1)}</Badge>;
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Invitation sent",
      description: `Invitation sent to ${inviteEmail} as ${inviteRole}`,
    });

    setInviteEmail("");
    setInviteRole("Clinician");
    setIsInviteOpen(false);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-l text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground">Manage users, rules, integrations, and security</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security & Audit</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>

        {/* Users & Roles */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Users & Roles</h3>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="inviteEmail">Email Address</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="user@hospital.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="inviteRole">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Clinician">Clinician</SelectItem>
                        <SelectItem value="Coordinator">Coordinator</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                        <SelectItem value="PT">PT</SelectItem>
                        <SelectItem value="OT">OT</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUser} className="bg-green-600 hover:bg-green-700 text-white">
                      Send Invitation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Lock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert Rules */}
        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Alert Rules</h3>
            <div className="flex space-x-2">
              <Dialog open={isNewRuleOpen} onOpenChange={setIsNewRuleOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Alert Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Natural Language Input Section */}
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <Label htmlFor="naturalLanguage" className="text-sm font-medium flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        Describe your rule in plain English
                      </Label>
                      <div className="space-y-2 mt-2">
                        <Textarea
                          id="naturalLanguage"
                          placeholder="e.g., Alert me when a patient's ADL score drops by 2 points within 3 days"
                          value={naturalLanguageInput}
                          onChange={(e) => setNaturalLanguageInput(e.target.value)}
                          className="min-h-[60px]"
                        />
                        <Button
                          type="button"
                          onClick={processNaturalLanguage}
                          disabled={isProcessingNL || !naturalLanguageInput.trim()}
                          className="w-full"
                          variant="outline"
                        >
                          {isProcessingNL ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wand2 className="h-4 w-4 mr-2" />
                              Generate Rule
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      or fill in the details manually
                    </div>

                    <div>
                      <Label htmlFor="ruleName">Rule Name</Label>
                      <Input
                        id="ruleName"
                        placeholder="Enter rule name"
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ruleCondition">Condition</Label>
                      <Input
                        id="ruleCondition"
                        placeholder="Enter rule condition"
                        value={newRuleCondition}
                        onChange={(e) => setNewRuleCondition(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ruleSeverity">Severity</Label>
                      <Select value={newRuleSeverity} onValueChange={setNewRuleSeverity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="ruleWindowSize">Window Size</Label>
                      <Input
                        id="ruleWindowSize"
                        placeholder="e.g., 7 days, Weekly"
                        value={newRuleWindowSize}
                        onChange={(e) => setNewRuleWindowSize(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsNewRuleOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createAlertRule} className="bg-green-600 hover:bg-green-700 text-white">
                        Create Rule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Edit Rule Dialog */}
              <Dialog open={isEditRuleOpen} onOpenChange={setIsEditRuleOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Alert Rule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="editRuleName">Rule Name</Label>
                      <Input
                        id="editRuleName"
                        placeholder="Enter rule name"
                        value={editRuleName}
                        onChange={(e) => setEditRuleName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editRuleCondition">Condition</Label>
                      <Input
                        id="editRuleCondition"
                        placeholder="Enter rule condition"
                        value={editRuleCondition}
                        onChange={(e) => setEditRuleCondition(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editRuleSeverity">Severity</Label>
                      <Select value={editRuleSeverity} onValueChange={setEditRuleSeverity}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editRuleWindowSize">Window Size</Label>
                      <Input
                        id="editRuleWindowSize"
                        placeholder="e.g., 7 days, Weekly"
                        value={editRuleWindowSize}
                        onChange={(e) => setEditRuleWindowSize(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditRuleOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={updateAlertRule} className="bg-green-600 hover:bg-green-700 text-white">
                        Update Rule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Test Rule
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        {getSeverityBadge(rule.severity)}
                        <Badge variant="outline">{rule.window_size}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.condition}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={() => toggleAlertRule(rule.id, rule.enabled)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {rule.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openEditRule(rule)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">Keywords Management</h3>
              <p className="text-muted-foreground">Manage OASIS item keywords and synonyms for enhanced search and filtering</p>
            </div>
          </div>
          <KeywordsManager />
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <h3 className="text-lg font-medium">Integrations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EHR Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Epic System</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Connection Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Connected</span>
                  </div>
                </div>
                <div>
                  <Label>Endpoint URL</Label>
                  <Input value="https://ehr.hospital.com/api/v1" readOnly />
                </div>
                <div>
                  <Label>Data Pull Schedule</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="30min">Every 30 minutes</SelectItem>
                      <SelectItem value="hourly">Every hour</SelectItem>
                      <SelectItem value="4hours">Every 4 hours</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="manual">Manual only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Last Sync</Label>
                    <div className="text-sm text-muted-foreground mt-1">2 minutes ago</div>
                  </div>
                  <div>
                    <Label>Next Sync</Label>
                    <div className="text-sm text-muted-foreground mt-1">58 minutes</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Sync Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Gmail Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Gmail Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Gmail Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Not configured</span>
                  </div>
                </div>
                <div>
                  <Label>Gmail Account</Label>
                  <Input placeholder="healthcare@hospital.com" />
                </div>
                <div>
                  <Label>Email Templates</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alerts">Alert Notifications</SelectItem>
                      <SelectItem value="reports">Daily Reports</SelectItem>
                      <SelectItem value="reminders">Assessment Reminders</SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label className="text-sm">Auto-send critical alerts</Label>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Gmail
                </Button>
              </CardContent>
            </Card>

            {/* Slack Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Webhook className="h-5 w-5" />
                  <span>Slack Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Webhook Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Not configured</span>
                  </div>
                </div>
                <div>
                  <Label>Webhook URL</Label>
                  <Input placeholder="https://hooks.slack.com/..." />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Setup Slack
                </Button>
              </CardContent>
            </Card>

            {/* Email Server */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email Server</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>SMTP Server</Label>
                  <Input placeholder="smtp.hospital.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Port</Label>
                    <Input placeholder="587" />
                  </div>
                  <div>
                    <Label>Security</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="TLS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Test Connection
                </Button>
              </CardContent>
            </Card>

            {/* Teams Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Microsoft Teams</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Teams Webhook Status</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Disconnected</span>
                  </div>
                </div>
                <div>
                  <Label>Channel Webhook</Label>
                  <Input placeholder="Teams webhook URL..." />
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Teams
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security & Audit */}
        <TabsContent value="security" className="space-y-4">
          <h3 className="text-lg font-medium">Security & Audit</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Force re-authentication on sensitive actions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Log all user sessions</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IP Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>IP Allowlist</Label>
                  <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Enable IP allowlist</Label>
                </div>
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  View Access Logs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit & Compliance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Enable audit logging</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>PHI access tracking</Label>
                </div>
                <div>
                  <Label>Audit Retention (days)</Label>
                  <Input type="number" defaultValue="2555" />
                </div>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Audit Log
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PHI Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Mask PHI in notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <Label>Watermark exported documents</Label>
                </div>
                <div>
                  <Label>Data retention policy (years)</Label>
                  <Input type="number" defaultValue="7" />
                </div>
                <Button variant="outline" className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Privacy Impact Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Brand */}
        <TabsContent value="brand" className="space-y-4">
          <h3 className="text-lg font-medium">Brand Customization</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Branding</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organization Logo</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload logo image</p>
                    <Button variant="outline" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Organization Name</Label>
                  <Input defaultValue="Kouper Health" />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input defaultValue="Your AI Coordinator" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Color Customization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-magenta-600 rounded border"></div>
                    <Input value="#C73866" readOnly />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded border"></div>
                    <Input value="#16A34A" readOnly />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-viridian-600 rounded border"></div>
                    <Input value="#1F2937" readOnly />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Reset to Default Colors
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}