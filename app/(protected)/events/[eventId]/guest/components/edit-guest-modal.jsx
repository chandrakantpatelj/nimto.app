'use client';

import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EditGuestModal({ guest, isOpen, onClose, onGuestUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'PENDING',
    response: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    if (guest && isOpen) {
      setFormData({
        name: guest.name || '',
        email: guest.email || '',
        phone: guest.phone || '',
        status: guest.status || 'PENDING',
        response: guest.response || '',
      });
    }
  }, [guest, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toastError('Name and email are required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiFetch('/api/events/guests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guest.id, ...formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to update guest');
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess('Guest updated successfully!');
        onGuestUpdated();
        onClose();
      } else {
        toastError(data.error || 'Failed to update guest');
      }
    } catch (error) {
      console.error('Error updating guest:', error);
      toastError('Failed to update guest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!guest) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {guest.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            Edit Guest Details
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Guest Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter guest name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">RSVP Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DECLINED">Declined</option>
              <option value="MAYBE">Maybe</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Response Notes</Label>
            <textarea
              id="response"
              value={formData.response}
              onChange={(e) => handleInputChange('response', e.target.value)}
              placeholder="Enter any response notes (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
