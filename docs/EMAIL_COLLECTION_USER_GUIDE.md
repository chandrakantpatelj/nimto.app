# Email Collection Feature - User Guide

## For Event Hosts

### Adding Guests with Phone Number Only

When creating or managing an event, you can now add guests with just their phone number:

**Step 1: Go to Guest Management**
- Navigate to your event
- Go to "Guest List" or "Invitations" section

**Step 2: Add Guest**
- Click "Add Guest"
- Enter guest name: `John Doe`
- Enter phone number: `+1234567890`
- Leave email field empty
- Click "Add"

**What Happens:**
- Guest is added to your event
- Guest can receive SMS invitation
- Email will be collected when they RSVP ✨

### Viewing Updated Guest Information

After a phone-only guest submits their RSVP:
- Their email will appear in the guest list
- You can now send email communications to them
- All future notifications can include email

---

## For Event Guests

### Scenario: You Received SMS Invitation (No Email)

**Step 1: Access Invitation**
- You receive an SMS with invitation link
- Click the link to view event details

**Step 2: View Event & RSVP Form**
- See event details (date, time, location)
- View RSVP form
- Email field shows: "Will be requested during RSVP"

**Step 3: Fill Out RSVP**
- Select your response:
  - ✅ Accept
  - ❌ Decline  
  - ❓ Maybe (if allowed)
  
**For "Accept" Response:**
- Enter/verify your name
- Add phone number (optional)
- Specify guest count (if plus ones allowed)
- Add any notes

**Step 4: Submit RSVP**
- Click "Submit RSVP"
- **Email Collection Dialog Appears** 🎉

### Email Collection Dialog

```
┌─────────────────────────────────────────────┐
│  📧 Email Required for RSVP                 │
├─────────────────────────────────────────────┤
│                                             │
│  To complete your RSVP, please provide     │
│  your email address. This will be used to  │
│  send you event updates and confirmations. │
│                                             │
│  Email Address *                            │
│  ┌─────────────────────────────────────┐   │
│  │ 📧 your.email@example.com          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ℹ️ Your email will be saved to your      │
│  guest profile and used for future event   │
│  communications.                            │
│                                             │
│  [Cancel]      [Continue with RSVP] ──►    │
│                                             │
└─────────────────────────────────────────────┘
```

**Step 5: Enter Your Email**
- Type your email address
- Click "Continue with RSVP"

**Validation:**
- ❌ Empty email → "Email is required"
- ❌ Invalid format → "Please enter a valid email address"
- ✅ Valid email → Proceeds to submit

**Step 6: RSVP Submitted**
- Success message appears
- Your email is saved
- You can now receive email updates

### If You Cancel Email Entry
- Dialog closes
- RSVP is NOT submitted
- You can try again by clicking "Submit RSVP"

---

## Visual Flow Diagram

### Phone-Only Guest Flow

```
┌─────────────────┐
│ Host adds guest │
│ (phone only)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest receives  │
│ SMS invitation  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest views     │
│ event & form    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest selects   │
│ RSVP response   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest clicks    │
│ "Submit RSVP"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 📧 Email Dialog │  ◄── NEW FEATURE
│    Appears      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest enters    │
│ email address   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email validated │
│ & saved to DB   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RSVP submitted  │
│ successfully!   │
└─────────────────┘
```

### Guest with Existing Email Flow

```
┌─────────────────┐
│ Host adds guest │
│ (with email)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest receives  │
│ email invite    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest views     │
│ event & form    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email shown     │
│ (read-only)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest selects   │
│ RSVP response   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Guest clicks    │
│ "Submit RSVP"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ RSVP submitted  │  ◄── No email dialog
│ directly!       │
└─────────────────┘
```

---

## Frequently Asked Questions

### For Hosts

**Q: Can I still add guests with email addresses?**  
A: Yes! Nothing changes. You can add guests with email, phone, or both.

**Q: Will guests with existing emails see the dialog?**  
A: No. Only guests added with phone number only will see the email collection dialog.

**Q: Can I see which guests have provided emails?**  
A: Yes. In your guest list, the email column will show the collected email addresses.

**Q: What if a guest doesn't want to provide their email?**  
A: They can click "Cancel" on the dialog. However, they won't be able to submit their RSVP without providing an email.

### For Guests

**Q: Why am I being asked for my email?**  
A: The host added you with just your phone number. Your email is needed so you can receive event updates and confirmations.

**Q: Is my email required?**  
A: Yes, to submit your RSVP. This ensures you receive important event updates.

**Q: Can I change my email later?**  
A: Once submitted, your email cannot be changed through the RSVP form. Contact the event host if you need to update it.

**Q: Will my email be shared?**  
A: Your email is only visible to the event host and used for event-related communications.

**Q: What if I entered the wrong email?**  
A: Contact the event host to update your email address.

---

## Benefits

### For Hosts
✅ Flexibility to add guests with phone only  
✅ Automatic email collection during RSVP  
✅ Complete contact information for all guests  
✅ Better communication capabilities  

### For Guests
✅ Simple, guided process  
✅ Clear instructions  
✅ Secure and validated  
✅ One-time entry  

---

## Technical Notes

- Email validation ensures proper format
- Emails are securely stored in the database
- The feature is fully backward compatible
- No changes to existing guest workflows
- Mobile-friendly responsive design

---

## Support

If you encounter any issues:
1. Check that you entered a valid email format
2. Try refreshing the page
3. Contact the event host
4. Reach out to platform support

---

*Last Updated: October 2025*

