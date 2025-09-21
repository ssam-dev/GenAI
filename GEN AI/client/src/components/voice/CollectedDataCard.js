import React from 'react';
import { User, MapPin, Palette, Phone, Mail, Lock, Edit3 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const fieldIcons = {
  name: User,
  location: MapPin,
  category: Palette,
  phone: Phone,
  email: Mail,
  password: Lock
};

const fieldLabels = {
  name: "Name",
  location: "Location", 
  category: "What You Make",
  phone: "Phone Number",
  email: "Email Address",
  password: "Password"
};

const fieldDescriptions = {
  name: "Your full name",
  location: "Where you live/work", 
  category: "Type of craft you make",
  phone: "Contact number (optional)",
  email: "Your login email",
  password: "Your secure account password"
};

export default function CollectedDataCard({ answers, onUpdateAnswer, editingField, setEditingField }) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-100 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2">
          <Mail className="w-6 h-6 text-orange-600" />
          Profile & Account Details
        </h3>
        
        <div className="space-y-5">
          {Object.entries(fieldLabels).map(([field, label]) => {
            const Icon = fieldIcons[field];
            const value = answers[field];
            const isEditing = editingField === field;
            const description = fieldDescriptions[field];
            const isPassword = field === 'password';
            
            return (
              <div key={field} className="group">
                <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-orange-50/50 transition-all duration-200 border border-transparent hover:border-orange-100">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Icon className="w-5 h-5 text-orange-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-800 text-lg">{label}</span>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField(isEditing ? null : field)}
                        className="h-8 w-8 p-0 hover:bg-orange-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-4 h-4 text-orange-600" />
                      </Button>
                    </div>
                    
                    {isEditing ? (
                      <Input
                        type={isPassword ? 'password' : 'text'}
                        value={value || ''}
                        onChange={(e) => onUpdateAnswer(field, e.target.value)}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingField(null);
                          }
                        }}
                        className="border-orange-200 focus:border-orange-400 bg-white"
                        autoFocus
                        placeholder={`Enter your ${label.toLowerCase()}...`}
                      />
                    ) : (
                      <div className="min-h-[2.5rem] flex items-center">
                        {value ? (
                          isPassword ? (
                            <span className="text-gray-700 font-medium text-2xl tracking-widest">
                              ••••••••
                            </span>
                          ) : (
                            <span className="text-gray-700 font-medium text-base leading-relaxed">
                              {value}
                            </span>
                          )
                        ) : (
                          <span className="text-gray-400 italic text-base">
                            {field === 'phone' ? 'Optional' : 'Not provided yet'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
