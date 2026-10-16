import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import payments from './payments'
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
const subscription = {
    show: Object.assign(show, show),
quote: Object.assign(quote, quote),
downgrade: Object.assign(downgrade, downgrade),
payments: Object.assign(payments, payments),
}

export default subscription