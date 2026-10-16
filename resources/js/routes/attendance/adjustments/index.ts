import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/attendance/adjustments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::index
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:20
 * @route '/api/attendance/adjustments'
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
* @see \App\Http\Controllers\AttendanceAdjustmentController::store
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:26
 * @route '/api/attendance/adjustments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/attendance/adjustments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::store
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:26
 * @route '/api/attendance/adjustments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::store
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:26
 * @route '/api/attendance/adjustments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::store
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:26
 * @route '/api/attendance/adjustments'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::store
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:26
 * @route '/api/attendance/adjustments'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::decide
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:67
 * @route '/api/attendance/adjustments/decide'
 */
export const decide = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

decide.definition = {
    methods: ["post"],
    url: '/api/attendance/adjustments/decide',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::decide
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:67
 * @route '/api/attendance/adjustments/decide'
 */
decide.url = (options?: RouteQueryOptions) => {
    return decide.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceAdjustmentController::decide
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:67
 * @route '/api/attendance/adjustments/decide'
 */
decide.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: decide.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::decide
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:67
 * @route '/api/attendance/adjustments/decide'
 */
    const decideForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: decide.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AttendanceAdjustmentController::decide
 * @see app/Http/Controllers/AttendanceAdjustmentController.php:67
 * @route '/api/attendance/adjustments/decide'
 */
        decideForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: decide.url(options),
            method: 'post',
        })
    
    decide.form = decideForm
const adjustments = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
decide: Object.assign(decide, decide),
}

export default adjustments