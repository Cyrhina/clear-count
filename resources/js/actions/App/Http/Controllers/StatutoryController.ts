import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/statutory',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StatutoryController::show
 * @see app/Http/Controllers/StatutoryController.php:21
 * @route '/api/statutory'
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
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
export const employees = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})

employees.definition = {
    methods: ["get","head"],
    url: '/api/statutory/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
employees.url = (options?: RouteQueryOptions) => {
    return employees.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
employees.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
employees.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employees.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
    const employeesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: employees.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
        employeesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\StatutoryController::employees
 * @see app/Http/Controllers/StatutoryController.php:93
 * @route '/api/statutory/employees'
 */
        employeesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    employees.form = employeesForm
/**
* @see \App\Http\Controllers\StatutoryController::preview
 * @see app/Http/Controllers/StatutoryController.php:105
 * @route '/api/statutory/preview'
 */
export const preview = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

preview.definition = {
    methods: ["post"],
    url: '/api/statutory/preview',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StatutoryController::preview
 * @see app/Http/Controllers/StatutoryController.php:105
 * @route '/api/statutory/preview'
 */
preview.url = (options?: RouteQueryOptions) => {
    return preview.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StatutoryController::preview
 * @see app/Http/Controllers/StatutoryController.php:105
 * @route '/api/statutory/preview'
 */
preview.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: preview.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\StatutoryController::preview
 * @see app/Http/Controllers/StatutoryController.php:105
 * @route '/api/statutory/preview'
 */
    const previewForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: preview.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StatutoryController::preview
 * @see app/Http/Controllers/StatutoryController.php:105
 * @route '/api/statutory/preview'
 */
        previewForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: preview.url(options),
            method: 'post',
        })
    
    preview.form = previewForm
/**
* @see \App\Http\Controllers\StatutoryController::update
 * @see app/Http/Controllers/StatutoryController.php:29
 * @route '/api/statutory'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/statutory',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StatutoryController::update
 * @see app/Http/Controllers/StatutoryController.php:29
 * @route '/api/statutory'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StatutoryController::update
 * @see app/Http/Controllers/StatutoryController.php:29
 * @route '/api/statutory'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\StatutoryController::update
 * @see app/Http/Controllers/StatutoryController.php:29
 * @route '/api/statutory'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\StatutoryController::update
 * @see app/Http/Controllers/StatutoryController.php:29
 * @route '/api/statutory'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    update.form = updateForm
const StatutoryController = { show, employees, preview, update }

export default StatutoryController