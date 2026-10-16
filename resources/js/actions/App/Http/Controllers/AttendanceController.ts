import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
const indexc675e45f382c27b3d66a0965dc441fd2 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexc675e45f382c27b3d66a0965dc441fd2.url(options),
    method: 'get',
})

indexc675e45f382c27b3d66a0965dc441fd2.definition = {
    methods: ["get","head"],
    url: '/api/v1/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
indexc675e45f382c27b3d66a0965dc441fd2.url = (options?: RouteQueryOptions) => {
    return indexc675e45f382c27b3d66a0965dc441fd2.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
indexc675e45f382c27b3d66a0965dc441fd2.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: indexc675e45f382c27b3d66a0965dc441fd2.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
indexc675e45f382c27b3d66a0965dc441fd2.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: indexc675e45f382c27b3d66a0965dc441fd2.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
    const indexc675e45f382c27b3d66a0965dc441fd2Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: indexc675e45f382c27b3d66a0965dc441fd2.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
        indexc675e45f382c27b3d66a0965dc441fd2Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexc675e45f382c27b3d66a0965dc441fd2.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/v1/attendance'
 */
        indexc675e45f382c27b3d66a0965dc441fd2Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: indexc675e45f382c27b3d66a0965dc441fd2.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    indexc675e45f382c27b3d66a0965dc441fd2.form = indexc675e45f382c27b3d66a0965dc441fd2Form
    /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
const index1616f23c7d46b4308cae4eec54abd55f = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index1616f23c7d46b4308cae4eec54abd55f.url(options),
    method: 'get',
})

index1616f23c7d46b4308cae4eec54abd55f.definition = {
    methods: ["get","head"],
    url: '/api/attendance',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
index1616f23c7d46b4308cae4eec54abd55f.url = (options?: RouteQueryOptions) => {
    return index1616f23c7d46b4308cae4eec54abd55f.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
index1616f23c7d46b4308cae4eec54abd55f.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index1616f23c7d46b4308cae4eec54abd55f.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
index1616f23c7d46b4308cae4eec54abd55f.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index1616f23c7d46b4308cae4eec54abd55f.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
    const index1616f23c7d46b4308cae4eec54abd55fForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index1616f23c7d46b4308cae4eec54abd55f.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
        index1616f23c7d46b4308cae4eec54abd55fForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index1616f23c7d46b4308cae4eec54abd55f.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\AttendanceController::index
 * @see app/Http/Controllers/AttendanceController.php:25
 * @route '/api/attendance'
 */
        index1616f23c7d46b4308cae4eec54abd55fForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index1616f23c7d46b4308cae4eec54abd55f.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index1616f23c7d46b4308cae4eec54abd55f.form = index1616f23c7d46b4308cae4eec54abd55fForm

/**
* Multiple routes resolve to \App\Http\Controllers\AttendanceController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/v1/attendance': indexc675e45f382c27b3d66a0965dc441fd2,
    '/api/attendance': index1616f23c7d46b4308cae4eec54abd55f,
}

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
const AttendanceController = { index, lateDates, log, biometrics }

export default AttendanceController