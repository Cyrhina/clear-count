import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/permission-map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PermissionMapController::index
 * @see app/Http/Controllers/PermissionMapController.php:22
 * @route '/api/permission-map'
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
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
export const capabilities = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: capabilities.url(options),
    method: 'get',
})

capabilities.definition = {
    methods: ["get","head"],
    url: '/api/permission-map/capabilities',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
capabilities.url = (options?: RouteQueryOptions) => {
    return capabilities.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
capabilities.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: capabilities.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
capabilities.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: capabilities.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
    const capabilitiesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: capabilities.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
        capabilitiesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: capabilities.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PermissionMapController::capabilities
 * @see app/Http/Controllers/PermissionMapController.php:38
 * @route '/api/permission-map/capabilities'
 */
        capabilitiesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: capabilities.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    capabilities.form = capabilitiesForm
/**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
export const show = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/permission-map/{role}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
show.url = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { role: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: typeof args.role === 'object'
                ? args.role.id
                : args.role,
                }

    return show.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
show.get = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
show.head = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
    const showForm = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
        showForm.get = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PermissionMapController::show
 * @see app/Http/Controllers/PermissionMapController.php:32
 * @route '/api/permission-map/{role}'
 */
        showForm.head = (args: { role: number | { id: number } } | [role: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    show.form = showForm
const permissionMap = {
    index: Object.assign(index, index),
capabilities: Object.assign(capabilities, capabilities),
show: Object.assign(show, show),
}

export default permissionMap