import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/platform/companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PlatformController::index
 * @see app/Http/Controllers/PlatformController.php:47
 * @route '/api/platform/companies'
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
* @see \App\Http\Controllers\PlatformController::store
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/platform/companies',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PlatformController::store
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::store
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PlatformController::store
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::store
 * @see app/Http/Controllers/PlatformController.php:63
 * @route '/api/platform/companies'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PlatformController::status
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
export const status = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: status.url(args, options),
    method: 'patch',
})

status.definition = {
    methods: ["patch"],
    url: '/api/platform/companies/{company}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PlatformController::status
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
status.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { company: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    company: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        company: typeof args.company === 'object'
                ? args.company.id
                : args.company,
                }

    return status.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::status
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
status.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: status.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\PlatformController::status
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
    const statusForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::status
 * @see app/Http/Controllers/PlatformController.php:88
 * @route '/api/platform/companies/{company}/status'
 */
        statusForm.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    status.form = statusForm
/**
* @see \App\Http\Controllers\PlatformController::plan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
export const plan = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: plan.url(args, options),
    method: 'patch',
})

plan.definition = {
    methods: ["patch"],
    url: '/api/platform/companies/{company}/plan',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\PlatformController::plan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
plan.url = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { company: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { company: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    company: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        company: typeof args.company === 'object'
                ? args.company.id
                : args.company,
                }

    return plan.definition.url
            .replace('{company}', parsedArgs.company.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PlatformController::plan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
plan.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: plan.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\PlatformController::plan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
    const planForm = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: plan.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PlatformController::plan
 * @see app/Http/Controllers/PlatformController.php:97
 * @route '/api/platform/companies/{company}/plan'
 */
        planForm.patch = (args: { company: number | { id: number } } | [company: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: plan.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    plan.form = planForm
const companies = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
status: Object.assign(status, status),
plan: Object.assign(plan, plan),
}

export default companies