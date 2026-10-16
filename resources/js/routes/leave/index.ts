import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import types from './types'
import requests from './requests'
/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
export const balances = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: balances.url(options),
    method: 'get',
})

balances.definition = {
    methods: ["get","head"],
    url: '/api/leave/balances',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
balances.url = (options?: RouteQueryOptions) => {
    return balances.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
balances.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: balances.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
balances.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: balances.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
    const balancesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: balances.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
        balancesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: balances.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\LeaveController::balances
 * @see app/Http/Controllers/LeaveController.php:168
 * @route '/api/leave/balances'
 */
        balancesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: balances.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    balances.form = balancesForm
/**
* @see \App\Http\Controllers\LeaveController::credits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
export const credits = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: credits.url(options),
    method: 'post',
})

credits.definition = {
    methods: ["post"],
    url: '/api/leave/credits',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\LeaveController::credits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
credits.url = (options?: RouteQueryOptions) => {
    return credits.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\LeaveController::credits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
credits.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: credits.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\LeaveController::credits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
    const creditsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: credits.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\LeaveController::credits
 * @see app/Http/Controllers/LeaveController.php:200
 * @route '/api/leave/credits'
 */
        creditsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: credits.url(options),
            method: 'post',
        })
    
    credits.form = creditsForm
const leave = {
    types: Object.assign(types, types),
requests: Object.assign(requests, requests),
balances: Object.assign(balances, balances),
credits: Object.assign(credits, credits),
}

export default leave