// Import necessary types and functions from Langium and other project files.
import { type Module, inject } from 'langium';
import { 
    createDefaultModule, 
    createDefaultSharedModule, 
    type DefaultSharedModuleContext, 
    type LangiumServices, 
    type LangiumSharedServices, 
    type PartialLangiumServices 
} from 'langium/lsp';
import { LimbooleGeneratedModule, LimbooleGeneratedSharedModule } from './generated/module.js';
import { LimbooleValidator, registerValidationChecks } from './limboole-validator.js';
import { LimbooleCompletionProvider } from './CompletionProvider.js';

/**
 * Declaration of custom services - add your own service classes here.
 * This specifies additional services beyond Langium's defaults.
 */
export type LimbooleAddedServices = {
    validation: {
        LimbooleValidator: LimbooleValidator // Custom validator service for Limboole.
    }
}

/**
 * Union of Langium default services and your custom services.
 * This is used as the type for services passed to custom service constructors.
 */
export type LimbooleServices = LangiumServices & LimbooleAddedServices;

/**
 * Dependency injection module for Limboole.
 * This module extends and overrides Langium's default services with custom implementations.
 */
export const LimbooleModule: Module<LimbooleServices, PartialLangiumServices & LimbooleAddedServices> = {
    // Provide the custom validation service for Limboole.
    validation: {
        LimbooleValidator: () => new LimbooleValidator()
    },
    // Override the default CompletionProvider with a custom implementation for Limboole.
    lsp: {
        CompletionProvider: (services) => new LimbooleCompletionProvider(services),
    }
};

/**
 * Creates the complete set of services required by Langium.
 *
 * This function assembles shared services (used across all languages) and 
 * language-specific services (customized for Limboole) into a cohesive service container.
 *
 * Steps:
 * 1. Inject shared services by merging:
 *    - Langium's default shared services.
 *    - Shared services generated by `langium-cli`.
 * 2. Inject Limboole-specific services by merging:
 *    - Langium's default language-specific services.
 *    - Services generated by `langium-cli`.
 *    - Custom services defined in this module.
 *
 * @param context Optional module context, such as the Language Server Protocol (LSP) connection.
 * @returns An object containing both shared and language-specific services.
 */
export function createLimbooleServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Limboole: LimbooleServices
} {
    // Merge and inject shared services (Langium defaults and generated shared services).
    const shared = inject(
        createDefaultSharedModule(context), // Langium's default shared services.
        LimbooleGeneratedSharedModule       // Shared services generated by langium-cli.
    );

    // Merge and inject language-specific services (Langium defaults, generated, and custom).
    const Limboole = inject(
        createDefaultModule({ shared }),   // Langium's default language-specific services.
        LimbooleGeneratedModule,          // Language-specific services generated by langium-cli.
        LimbooleModule                    // Custom Limboole-specific services.
    );

    // Register the Limboole services in the shared service registry.
    shared.ServiceRegistry.register(Limboole);

    // Register custom validation checks for Limboole.
    registerValidationChecks(Limboole);

    // If not running inside a language server, initialize the configuration provider instantly.
    if (!context.connection) {
        shared.workspace.ConfigurationProvider.initialized({});
    }

    // Return the assembled services (shared and language-specific).
    return { shared, Limboole };
}
