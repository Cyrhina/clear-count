import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/platform/payments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:106
 * @route '/api/platform/payments'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\PlatformController::decision
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
export const decision = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decision.url(args, options),
    method: 'post',
})

decision.definition = {
    methods: ["post"],
    url: '/api/platform/payments/{payment}/decision',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlatformController::decision
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
decision.url = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payment: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { payment: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    payment: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        payment: typeof args.payment === 'object'
                ? args.payment.id
                : args.payment,
                }

    return decision.definition.url
            .replace('{payment}', parsedArgs.payment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::decision
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
decision.post = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decision.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PlatformController::decision
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
    const decisionForm = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decision.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::decision
 * @see app/Http/Controllers/PlatformController.php:115
 * @route '/api/platform/payments/{payment}/decision'
 */
        decisionForm.post = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decision.url(args, options),
            method: 'post',
        })
    
    decision.form = decisionForm
const payments = {
    index: Object.assign(index, index),
decision: Object.assign(decision, decision),
}

export default payments