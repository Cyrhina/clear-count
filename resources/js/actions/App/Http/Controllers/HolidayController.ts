import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/holidays',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\HolidayController::index
 * @see app/Http/Controllers/HolidayController.php:24
 * @route '/api/holidays'
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
* @see \App\Http\Controllers\HolidayController::store
 * @see app/Http/Controllers/HolidayController.php:44
 * @route '/api/holidays'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/holidays',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HolidayController::store
 * @see app/Http/Controllers/HolidayController.php:44
 * @route '/api/holidays'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HolidayController::store
 * @see app/Http/Controllers/HolidayController.php:44
 * @route '/api/holidays'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HolidayController::store
 * @see app/Http/Controllers/HolidayController.php:44
 * @route '/api/holidays'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HolidayController::store
 * @see app/Http/Controllers/HolidayController.php:44
 * @route '/api/holidays'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\HolidayController::bulkImportDefaults
 * @see app/Http/Controllers/HolidayController.php:76
 * @route '/api/holidays/import-defaults'
 */
export const bulkImportDefaults = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkImportDefaults.url(options),
    method: 'post',
})

bulkImportDefaults.definition = {
    methods: ["post"],
    url: '/api/holidays/import-defaults',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\HolidayController::bulkImportDefaults
 * @see app/Http/Controllers/HolidayController.php:76
 * @route '/api/holidays/import-defaults'
 */
bulkImportDefaults.url = (options?: RouteQueryOptions) => {
    return bulkImportDefaults.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\HolidayController::bulkImportDefaults
 * @see app/Http/Controllers/HolidayController.php:76
 * @route '/api/holidays/import-defaults'
 */
bulkImportDefaults.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: bulkImportDefaults.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\HolidayController::bulkImportDefaults
 * @see app/Http/Controllers/HolidayController.php:76
 * @route '/api/holidays/import-defaults'
 */
    const bulkImportDefaultsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: bulkImportDefaults.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HolidayController::bulkImportDefaults
 * @see app/Http/Controllers/HolidayController.php:76
 * @route '/api/holidays/import-defaults'
 */
        bulkImportDefaultsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: bulkImportDefaults.url(options),
            method: 'post',
        })
    
    bulkImportDefaults.form = bulkImportDefaultsForm
/**
* @see \App\Http\Controllers\HolidayController::update
 * @see app/Http/Controllers/HolidayController.php:52
 * @route '/api/holidays/{holiday}'
 */
export const update = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/holidays/{holiday}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\HolidayController::update
 * @see app/Http/Controllers/HolidayController.php:52
 * @route '/api/holidays/{holiday}'
 */
update.url = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { holiday: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { holiday: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    holiday: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        holiday: typeof args.holiday === 'object'
                ? args.holiday.id
                : args.holiday,
                }

    return update.definition.url
            .replace('{holiday}', parsedArgs.holiday.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HolidayController::update
 * @see app/Http/Controllers/HolidayController.php:52
 * @route '/api/holidays/{holiday}'
 */
update.put = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\HolidayController::update
 * @see app/Http/Controllers/HolidayController.php:52
 * @route '/api/holidays/{holiday}'
 */
    const updateForm = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HolidayController::update
 * @see app/Http/Controllers/HolidayController.php:52
 * @route '/api/holidays/{holiday}'
 */
        updateForm.put = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
/**
* @see \App\Http\Controllers\HolidayController::destroy
 * @see app/Http/Controllers/HolidayController.php:62
 * @route '/api/holidays/{holiday}'
 */
export const destroy = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/holidays/{holiday}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\HolidayController::destroy
 * @see app/Http/Controllers/HolidayController.php:62
 * @route '/api/holidays/{holiday}'
 */
destroy.url = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { holiday: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { holiday: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    holiday: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        holiday: typeof args.holiday === 'object'
                ? args.holiday.id
                : args.holiday,
                }

    return destroy.definition.url
            .replace('{holiday}', parsedArgs.holiday.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\HolidayController::destroy
 * @see app/Http/Controllers/HolidayController.php:62
 * @route '/api/holidays/{holiday}'
 */
destroy.delete = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\HolidayController::destroy
 * @see app/Http/Controllers/HolidayController.php:62
 * @route '/api/holidays/{holiday}'
 */
    const destroyForm = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\HolidayController::destroy
 * @see app/Http/Controllers/HolidayController.php:62
 * @route '/api/holidays/{holiday}'
 */
        destroyForm.delete = (args: { holiday: number | { id: number } } | [holiday: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const HolidayController = { index, store, bulkImportDefaults, update, destroy }

export default HolidayController