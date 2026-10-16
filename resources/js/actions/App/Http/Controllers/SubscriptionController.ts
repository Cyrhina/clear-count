import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/subscription',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SubscriptionController::show
 * @see app/Http/Controllers/SubscriptionController.php:24
 * @route '/api/subscription'
 */
        showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
/**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
export const quote = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: quote.url(args, options),
    method: 'get',
})

quote.definition = {
    methods: ["get","head"],
    url: '/api/subscription/quote/{tier}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
quote.url = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { tier: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    tier: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        tier: args.tier,
                }

    return quote.definition.url
            .replace('{tier}', parsedArgs.tier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
quote.get = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: quote.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
quote.head = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: quote.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
    const quoteForm = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: quote.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
        quoteForm.get = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: quote.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\SubscriptionController::quote
 * @see app/Http/Controllers/SubscriptionController.php:42
 * @route '/api/subscription/quote/{tier}'
 */
        quoteForm.head = (args: { tier: string | number } | [tier: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: quote.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    quote.form = quoteForm
/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:50
 * @route '/api/subscription/downgrade'
 */
export const downgrade = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: downgrade.url(options),
    method: 'post',
})

downgrade.definition = {
    methods: ["post"],
    url: '/api/subscription/downgrade',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:50
 * @route '/api/subscription/downgrade'
 */
downgrade.url = (options?: RouteQueryOptions) => {
    return downgrade.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:50
 * @route '/api/subscription/downgrade'
 */
downgrade.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: downgrade.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:50
 * @route '/api/subscription/downgrade'
 */
    const downgradeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: downgrade.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SubscriptionController::downgrade
 * @see app/Http/Controllers/SubscriptionController.php:50
 * @route '/api/subscription/downgrade'
 */
        downgradeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: downgrade.url(options),
            method: 'post',
        })
    
    downgrade.form = downgradeForm
/**
* @see \App\Http\Controllers\SubscriptionController::storePayment
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
export const storePayment = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePayment.url(options),
    method: 'post',
})

storePayment.definition = {
    methods: ["post"],
    url: '/api/subscription/payments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\SubscriptionController::storePayment
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
storePayment.url = (options?: RouteQueryOptions) => {
    return storePayment.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\SubscriptionController::storePayment
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
storePayment.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storePayment.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\SubscriptionController::storePayment
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
    const storePaymentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: storePayment.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\SubscriptionController::storePayment
 * @see app/Http/Controllers/SubscriptionController.php:72
 * @route '/api/subscription/payments'
 */
        storePaymentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: storePayment.url(options),
            method: 'post',
        })
    
    storePayment.form = storePaymentForm
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
const SubscriptionController = { show, quote, downgrade, storePayment, proof }

export default SubscriptionController