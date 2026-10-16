import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/me',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\MeController::show
 * @see app/Http/Controllers/MeController.php:14
 * @route '/api/me'
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
* @see \App\Http\Controllers\MeController::update
 * @see app/Http/Controllers/MeController.php:22
 * @route '/api/me'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/api/me',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\MeController::update
 * @see app/Http/Controllers/MeController.php:22
 * @route '/api/me'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MeController::update
 * @see app/Http/Controllers/MeController.php:22
 * @route '/api/me'
 */
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\MeController::update
 * @see app/Http/Controllers/MeController.php:22
 * @route '/api/me'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\MeController::update
 * @see app/Http/Controllers/MeController.php:22
 * @route '/api/me'
 */
        updateForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const me = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
}

export default me