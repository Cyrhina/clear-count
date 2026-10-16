import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import adjustments from './adjustments'
/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
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
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
export const lateDates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lateDates.url(options),
    method: 'get',
})

lateDates.definition = {
    methods: ["get","head"],
    url: '/api/attendance/late-dates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
lateDates.url = (options?: RouteQueryOptions) => {
    return lateDates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
lateDates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lateDates.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
lateDates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lateDates.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
    const lateDatesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lateDates.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
        lateDatesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lateDates.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AttendanceController::lateDates
 * @see app/Http/Controllers/AttendanceController.php:50
 * @route '/api/attendance/late-dates'
 */
        lateDatesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lateDates.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lateDates.form = lateDatesForm
/**
* @see \App\Http\Controllers\AttendanceController::log
 * @see app/Http/Controllers/AttendanceController.php:58
 * @route '/api/attendance/log'
 */
export const log = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: log.url(options),
    method: 'post',
})

log.definition = {
    methods: ["post"],
    url: '/api/attendance/log',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AttendanceController::log
 * @see app/Http/Controllers/AttendanceController.php:58
 * @route '/api/attendance/log'
 */
log.url = (options?: RouteQueryOptions) => {
    return log.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceController::log
 * @see app/Http/Controllers/AttendanceController.php:58
 * @route '/api/attendance/log'
 */
log.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: log.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AttendanceController::log
 * @see app/Http/Controllers/AttendanceController.php:58
 * @route '/api/attendance/log'
 */
    const logForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: log.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AttendanceController::log
 * @see app/Http/Controllers/AttendanceController.php:58
 * @route '/api/attendance/log'
 */
        logForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: log.url(options),
            method: 'post',
        })
    
    log.form = logForm
/**
* @see \App\Http\Controllers\AttendanceController::biometrics
 * @see app/Http/Controllers/AttendanceController.php:115
 * @route '/api/attendance/biometrics'
 */
export const biometrics = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: biometrics.url(options),
    method: 'post',
})

biometrics.definition = {
    methods: ["post"],
    url: '/api/attendance/biometrics',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AttendanceController::biometrics
 * @see app/Http/Controllers/AttendanceController.php:115
 * @route '/api/attendance/biometrics'
 */
biometrics.url = (options?: RouteQueryOptions) => {
    return biometrics.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceController::biometrics
 * @see app/Http/Controllers/AttendanceController.php:115
 * @route '/api/attendance/biometrics'
 */
biometrics.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: biometrics.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\AttendanceController::biometrics
 * @see app/Http/Controllers/AttendanceController.php:115
 * @route '/api/attendance/biometrics'
 */
    const biometricsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: biometrics.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\AttendanceController::biometrics
 * @see app/Http/Controllers/AttendanceController.php:115
 * @route '/api/attendance/biometrics'
 */
        biometricsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: biometrics.url(options),
            method: 'post',
        })
    
    biometrics.form = biometricsForm
const attendance = {
    index: Object.assign(index, index),
lateDates: Object.assign(lateDates, lateDates),
adjustments: Object.assign(adjustments, adjustments),
log: Object.assign(log, log),
biometrics: Object.assign(biometrics, biometrics),
}

export default attendance