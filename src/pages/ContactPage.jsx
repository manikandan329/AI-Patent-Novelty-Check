import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitted(true);
    toast.success('Thank you! Your message has been sent.');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Contact Us
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
          Get in Touch with Our <span className="text-gradient-primary">IP & AI Team</span>
        </h1>
        <p className="text-sm text-text-muted leading-relaxed">
          Questions regarding custom API integrations, enterprise security, or law firm volume licensing? We're here to help.
        </p>
      </div>

      <Card className="max-w-xl mx-auto border-card-border p-6 sm:p-8">
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
            <h3 className="text-xl font-bold text-text-main">Message Received!</h3>
            <p className="text-xs text-text-muted">
              An enterprise IP specialist will reply to {email} within 24 business hours.
            </p>
            <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Your Name"
              placeholder="Dr. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Work Email Address"
              type="email"
              placeholder="sarah@firm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
                Message / Inquiry
              </label>
              <textarea
                rows={4}
                className="w-full bg-[#0F172A]/80 border border-card-border rounded-xl p-3 text-sm text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Details about your patent novelty checking requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" size="lg" icon={Send} className="w-full">
              Submit Contact Inquiry
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ContactPage;
