import { type Module, inject } from 'langium';
import { createDefaultModule, createDefaultSharedModule, type DefaultSharedModuleContext, type LangiumServices, type LangiumSharedServices, type PartialLangiumServices } from 'langium/lsp';
import { LimbooleGeneratedModule, LimbooleGeneratedSharedModule } from './generated/module.js';
import { LimbooleValidator, registerValidationChecks } from './limboole-validator.js';
import { LimbooleCodeActionProvider } from './limboole-code-action.js';
import { ExpressionCollection, registerExpressionCollector } from './limboole-expression-collector.js';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type LimbooleAddedServices = {
    validation: {
        LimbooleValidator: LimbooleValidator
    },
    utils: {
        LimbooleExpressionCollector: ExpressionCollection
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type LimbooleServices = LangiumServices & LimbooleAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const LimbooleModule: Module<LimbooleServices, PartialLangiumServices & LimbooleAddedServices> = {
    validation: {
        LimbooleValidator: (services) => new LimbooleValidator(services),
    },
    utils: {
        LimbooleExpressionCollector: () => new ExpressionCollection()
    },
    lsp: {
        CodeActionProvider: (services) => new LimbooleCodeActionProvider(services),
    },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createLimbooleServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    Limboole: LimbooleServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        LimbooleGeneratedSharedModule
    );
    const Limboole = inject(
        createDefaultModule({ shared }),
        LimbooleGeneratedModule,
        LimbooleModule
    );
    shared.ServiceRegistry.register(Limboole);


    registerValidationChecks(Limboole);
    registerExpressionCollector(Limboole);

    if (!context.connection) {
        // We don't run inside a language server
        // Therefore, initialize the configuration provider instantly
        shared.workspace.ConfigurationProvider.initialized({});
    }
    return { shared, Limboole };
}
