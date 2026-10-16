import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SubscriptionController::store
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/subscription/payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::store
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::store
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SubscriptionController::store
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SubscriptionController::store
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
export const proof = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: proof.url(args, options),
    method: 'get',
})

proof.definition = {
    methods: ["get","head"],
    url: '/api/subscription/payments/{payment}/proof',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
proof.url = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return proof.definition.url
            .replace('{payment}', parsedArgs.payment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
proof.get = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: proof.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
proof.head = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: proof.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
    const proofForm = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: proof.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
        proofForm.get = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: proof.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SubscriptionController::proof
 * @see app/Http/Controllers/SubscriptionController.php:109
 * @route '/api/subscription/payments/{payment}/proof'
 */
        proofForm.head = (args: { payment: number | { id: number } } | [payment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: proof.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    proof.form = proofForm
const payments = {
    store: Object.assign(store, store),
proof: Object.assign(proof, proof),
}

export default payments