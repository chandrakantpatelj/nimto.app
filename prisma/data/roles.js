const roles = [
	{
		slug: 'super-admin',
		isProtected: true,
		name: 'Super Admin',
		description: 'Full control over the application, including user management, role management, and all settings.',
	},
	{
		slug: 'application-admin',
		name: 'Application Admin',
		description: 'Manages application-wide events, templates, and communications. Can manage most users except Super Admins.',
	},
	{
		slug: 'host',
		name: 'Host',
		description: 'Creates and manages their own events, guest lists, and event-specific communications.',
	},
	{
		slug: 'attendee',
		name: 'Attendee',
		isDefault: true,
		description: 'Registered user who can attend events, RSVP, and use attendee-specific features.',
	},
];

module.exports = roles;
