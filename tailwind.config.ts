import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['DM Sans', 'system-ui', 'sans-serif'],
			},
			fontSize: {
				// Typography system
				'heading-xl': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '600' }],
				'heading-l': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }],
				'heading-m': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
				'heading-s': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
				'body-l-medium': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
				'body-l-regular': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
				'body-m-medium': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
				'body-m-regular': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
				'body-s-medium': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
				'body-s-regular': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
				'label': ['0.75rem', { lineHeight: '1rem', fontWeight: '600' }],
				'caption': ['0.6875rem', { lineHeight: '1rem', fontWeight: '400' }],
				'overline': ['0.6875rem', { lineHeight: '1rem', fontWeight: '400' }],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				/* Kouper Color System */
				magenta: {
					50: 'hsl(var(--primary-magenta-50))',
					100: 'hsl(var(--primary-magenta-100))',
					200: 'hsl(var(--primary-magenta-200))',
					300: 'hsl(var(--primary-magenta-300))',
					400: 'hsl(var(--primary-magenta-400))',
					500: 'hsl(var(--primary-magenta-500))',
					600: 'hsl(var(--primary-magenta-600))',
					700: 'hsl(var(--primary-magenta-700))',
					800: 'hsl(var(--primary-magenta-800))',
					900: 'hsl(var(--primary-magenta-900))',
					950: 'hsl(var(--primary-magenta-950))'
				},
				green: {
					50: 'hsl(var(--primary-green-50))',
					100: 'hsl(var(--primary-green-100))',
					200: 'hsl(var(--primary-green-200))',
					300: 'hsl(var(--primary-green-300))',
					400: 'hsl(var(--primary-green-400))',
					500: 'hsl(var(--primary-green-500))',
					600: 'hsl(var(--primary-green-600))',
					700: 'hsl(var(--primary-green-700))',
					800: 'hsl(var(--primary-green-800))',
					900: 'hsl(var(--primary-green-900))',
					950: 'hsl(var(--primary-green-950))'
				},
				viridian: {
					50: 'hsl(var(--primary-viridian-50))',
					100: 'hsl(var(--primary-viridian-100))',
					200: 'hsl(var(--primary-viridian-200))',
					300: 'hsl(var(--primary-viridian-300))',
					400: 'hsl(var(--primary-viridian-400))',
					500: 'hsl(var(--primary-viridian-500))',
					600: 'hsl(var(--primary-viridian-600))',
					700: 'hsl(var(--primary-viridian-700))',
					800: 'hsl(var(--primary-viridian-800))',
					900: 'hsl(var(--primary-viridian-900))',
					950: 'hsl(var(--primary-viridian-950))'
				},
				gray: {
					25: 'hsl(var(--neutral-gray-25))',
					50: 'hsl(var(--neutral-gray-50))',
					100: 'hsl(var(--neutral-gray-100))',
					200: 'hsl(var(--neutral-gray-200))',
					300: 'hsl(var(--neutral-gray-300))',
					400: 'hsl(var(--neutral-gray-400))',
					500: 'hsl(var(--neutral-gray-500))',
					600: 'hsl(var(--neutral-gray-600))',
					700: 'hsl(var(--neutral-gray-700))',
					800: 'hsl(var(--neutral-gray-800))',
					900: 'hsl(var(--neutral-gray-900))',
					950: 'hsl(var(--neutral-gray-950))'
				},
				/* AI Interface Colors */
				ai: {
					primary: 'hsl(var(--ai-primary))',
					secondary: 'hsl(var(--ai-secondary))',
					accent: 'hsl(var(--ai-accent))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			/* Healthcare Gradients */
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-clinical': 'var(--gradient-clinical)',
				'gradient-risk': 'var(--gradient-risk)'
			},
			/* Clinical Box Shadows */
			boxShadow: {
				'clinical': 'var(--shadow-clinical)',
				'elevated': 'var(--shadow-elevated)',
				'ai': 'var(--shadow-ai)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
