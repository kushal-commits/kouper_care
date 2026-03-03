import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Users, Activity, TrendingUp, Clock, User, CheckCircle } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export function FormattedMessage({ content, sender, timestamp }: FormattedMessageProps) {
  if (sender === 'user') {
    return (
      <motion.div 
        className="max-w-[80%] rounded-lg px-3 py-2 bg-primary text-primary-foreground"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <p className="text-sm">{content}</p>
        <p className="text-xs opacity-70 mt-1">
          {timestamp.toLocaleTimeString()}
        </p>
      </motion.div>
    );
  }

  // Format AI responses with clean, structured layout
  return (
    <motion.div 
      className="max-w-[95%] space-y-4"
      whileHover={{ scale: 1.005 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="border-l-4 border-l-primary bg-background/50 rounded-r-lg p-4 space-y-4">
        <FormattedContent content={content} />
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            AI Assistant
          </span>
          <span>{timestamp.toLocaleTimeString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

function FormattedContent({ content }: { content: string }) {
  // Simply display the content with basic formatting
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return <div className="text-sm text-slate-700">No response received</div>;
  }
  
  return (
    <div className="text-sm leading-relaxed space-y-2">
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Skip empty lines and separators
        if (!trimmedLine || trimmedLine.match(/^[=]+$/)) {
          return null;
        }
        
        return (
          <div key={index} className="text-slate-700">
            {trimmedLine}
          </div>
        );
      })}
    </div>
  );
}

function parseContentSections(content: string) {
  const sections: Array<{ type: string; content: string; title?: string }> = [];
  const lines = content.split('\n');
  
  let currentSection: { type: string; content: string; title?: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) continue;
    
    // Detect section headers
    if (trimmedLine.toUpperCase().includes('OVERVIEW') || trimmedLine.toUpperCase().includes('SUMMARY')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'overview', content: '', title: trimmedLine };
    } else if (trimmedLine.toUpperCase().includes('PATIENTS') || trimmedLine.toUpperCase().includes('CRITICAL')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'patients', content: '', title: trimmedLine };
    } else if (trimmedLine.toUpperCase().includes('STAFF') || trimmedLine.toUpperCase().includes('NURSES')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'staff', content: '', title: trimmedLine };
    } else if (trimmedLine.toUpperCase().includes('ALERT') || trimmedLine.toUpperCase().includes('ATTENTION')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'alerts', content: '', title: trimmedLine };
    } else if (trimmedLine.toUpperCase().includes('ACTION') || trimmedLine.toUpperCase().includes('RECENT')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'actions', content: '', title: trimmedLine };
    } else if (trimmedLine.toUpperCase().includes('TREND') || trimmedLine.toUpperCase().includes('RISK')) {
      if (currentSection) sections.push(currentSection);
      currentSection = { type: 'trends', content: '', title: trimmedLine };
    } else if (trimmedLine.match(/^[=]+$/)) {
      // Skip separator lines
      continue;
    } else {
      // Add content to current section or create text section
      if (!currentSection) {
        currentSection = { type: 'text', content: '' };
      }
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
  }
  
  if (currentSection) sections.push(currentSection);
  
  return sections;
}

function OverviewSection({ content }: { content: string }) {
  const metrics = extractMetrics(content);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Activity className="h-4 w-4" />
        System Overview
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground font-medium">{metric.label}</div>
            <div className="text-lg font-bold text-primary mt-1">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientsSection({ content }: { content: string }) {
  // Parse patient data more intelligently
  const lines = content.split('\n').filter(line => line.trim());
  const patientEntries: Array<{ name: string; details: string[] }> = [];
  
  let currentPatient: { name: string; details: string[] } | null = null;
  
  for (const line of lines) {
    if (line.includes('PATIENT:')) {
      if (currentPatient) patientEntries.push(currentPatient);
      const name = line.replace('PATIENT:', '').trim();
      currentPatient = { name, details: [] };
    } else if (currentPatient && line.trim().startsWith('-')) {
      currentPatient.details.push(line.replace(/^-\s*/, '').trim());
    } else if (line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
      if (!currentPatient) {
        currentPatient = { name: 'Patient Information', details: [] };
      }
      currentPatient.details.push(line.replace(/^[•\d.]+\s*/, '').trim());
    }
  }
  
  if (currentPatient) patientEntries.push(currentPatient);
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
        <User className="h-4 w-4" />
        Patient Information
      </div>
      <div className="space-y-3">
        {patientEntries.length > 0 ? patientEntries.map((patient, index) => (
          <div key={index} className="bg-blue-50/50 border border-blue-200/30 rounded-lg p-3">
            <div className="font-medium text-sm text-blue-800 mb-2">{patient.name}</div>
            <div className="space-y-1">
              {patient.details.map((detail, detailIndex) => (
                <div key={detailIndex} className="text-xs text-slate-700 flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{detail}</span>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-sm text-muted-foreground bg-slate-50 p-3 rounded-lg border border-slate-200">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}

function StaffSection({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
        <Users className="h-4 w-4" />
        Staff Information
      </div>
      <div className="text-sm bg-blue-50 p-2 rounded">
        {content.split('\n').map((line, index) => (
          <div key={index} className="text-xs">{line}</div>
        ))}
      </div>
    </div>
  );
}

function AlertsSection({ content }: { content: string }) {
  const alerts = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().match(/^\d+\./) || line.trim().startsWith('-'));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
        <AlertTriangle className="h-4 w-4" />
        Alerts & Attention
      </div>
      <div className="space-y-2">
        {alerts.length > 0 ? alerts.map((alert, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-red-50/70 border border-red-200/50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800 leading-relaxed">
              {alert.replace(/^[•\d.-]+\s*/, '')}
            </div>
          </div>
        )) : (
          <div className="flex items-center gap-3 p-3 bg-green-50/70 border border-green-200/50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="text-sm text-green-800">All patients stable - No active alerts</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionsSection({ content }: { content: string }) {
  const actions = content.split('\n').filter(line => line.trim().startsWith('•') || line.trim().match(/^\d+\./));
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
        <Clock className="h-4 w-4" />
        Recent Actions
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {actions.slice(0, 5).map((action, index) => (
          <div key={index} className="flex items-start gap-2 p-2 bg-purple-50 rounded text-xs">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
            <span>{action.replace(/^[•\d.]+\s*/, '')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendsSection({ content }: { content: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
        <TrendingUp className="h-4 w-4" />
        Trends & Analytics
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {content.split('\n').map((line, index) => {
          const [label, value] = line.split(':');
          if (!value) return <div key={index} className="col-span-2 text-muted-foreground">{line}</div>;
          
          return (
            <div key={index} className="flex justify-between p-1 bg-green-50 rounded">
              <span>{label.trim()}</span>
              <span className="font-medium">{value.trim()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TextSection({ content }: { content: string }) {
  // Check if content looks like structured data
  if (content.includes(':') && content.includes('\n')) {
    const lines = content.split('\n').filter(line => line.trim());
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
        {lines.map((line, index) => {
          if (line.includes(':')) {
            const [label, value] = line.split(':').map(s => s.trim());
            return (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            );
          }
          return <div key={index} className="text-sm text-slate-700">{line}</div>;
        })}
      </div>
    );
  }
  
  return (
    <div className="text-sm leading-relaxed text-slate-700 bg-slate-50/50 p-3 rounded-lg border border-slate-200/50">
      {content}
    </div>
  );
}

function extractMetrics(content: string): Array<{ label: string; value: string }> {
  const metrics: Array<{ label: string; value: string }> = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/(\w+[\w\s]+?):\s*(\d+[\w\s]*)/);
    if (match) {
      metrics.push({
        label: match[1].trim(),
        value: match[2].trim()
      });
    }
  }
  
  return metrics;
}