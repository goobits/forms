/**
 * Type definitions for @goobits/forms configuration
 */

import type { ZodSchema } from 'zod';

// Basic interfaces
export interface MessageObject {
	[key: string]: string | ((...args: unknown[]) => string);
}

export interface FieldConfig {
	type?: string;
	required?: boolean;
	placeholder?: string;
	label?: string;
	validation?: ZodSchema;
	maxlength?: number;
	rows?: number;
	multiple?: boolean;
	accept?: string;
	maxFiles?: number;
	maxSize?: number;
	autoDetect?: boolean;
}

export interface CategoryConfig {
	fields: string[];
	label?: string;
	icon?: string;
	[key: string]: unknown;
}

export interface FileSettings {
	maxSize?: number;
	acceptedImageTypes?: string[];
	allowedTypes?: string[];
	maxFiles?: number;
	maxFileSize?: number;
}

export interface RecaptchaConfig {
	enabled: boolean;
	provider?: 'google-v3' | 'google-v2' | 'hcaptcha';
	siteKey?: string;
	minScore?: number;
}

export interface ApiConfig {
	endpoint?: string;
	headers?: Record<string, string>;
}

export interface UiConfigOptions {
	submitButtonText?: string;
	submittingButtonText?: string;
	resetAfterSubmit?: boolean;
	showSuccessMessage?: boolean;
	successMessageDuration?: number;
	theme?: 'light' | 'dark' | 'auto';
}

export interface FormEmailMessage {
	to: string;
	subject: string;
	html: string;
	text: string;
}

export interface FormEmailSender {
	send(message: FormEmailMessage): Promise<unknown>;
}

export interface FormSubmissionLocals {
	emailService?: FormEmailSender;
}

export interface I18nConfig {
	locale?: string;
	translations?: Record<string, MessageObject>;
}

export interface ContactFormConfig {
	appName: string;
	formUri: string;
	errorMessages: MessageObject;
	successMessages?: MessageObject;
	fieldConfigs: Record<string, FieldConfig>;
	categories: Record<string, CategoryConfig>;
	fileSettings: FileSettings;
	defaultRecipient?: string;
	defaultSubject?: string;
	i18n?: I18nConfig;
	// Additional extended properties
	recaptcha?: RecaptchaConfig;
	api?: ApiConfig;
	ui?: UiConfigOptions;
	// Dynamic properties added during initialization
	schemas?: {
		schemas: Record<string, ZodSchema>;
		categories: Record<string, ZodSchema>;
	};
	categoryToFieldMap?: Record<string, string[]>;
	formDataParser?: (formData: FormData, category?: string) => Promise<ValidationResult>;
	createSubmissionHandler?: (
		options?: Record<string, unknown>
	) => (
		data: FormData,
		category: string,
		locals?: FormSubmissionLocals
	) => Promise<SubmissionResult>;
}

export interface FormData {
	[key: string]: unknown;
	attachments?: File[];
}

export interface ValidationResult {
	isValid: boolean;
	errors?: Record<string, string>;
	data?: FormData;
}

export interface SubmissionResult {
	success: boolean;
	message?: string;
	errors?: Record<string, string>;
}
