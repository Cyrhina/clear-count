import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
export const templates = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})

templates.definition = {
    methods: ["get","head"],
    url: '/api/schedules/templates',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
templates.url = (options?: RouteQueryOptions) => {
    return templates.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
templates.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: templates.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
templates.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: templates.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
    const templatesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: templates.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
        templatesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: templates.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShiftRosterController::templates
 * @see app/Http/Controllers/ShiftRosterController.php:25
 * @route '/api/schedules/templates'
 */
        templatesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: templates.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    templates.form = templatesForm
/**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
export const roster = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roster.url(options),
    method: 'get',
})

roster.definition = {
    methods: ["get","head"],
    url: '/api/schedules/roster',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
roster.url = (options?: RouteQueryOptions) => {
    return roster.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
roster.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: roster.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
roster.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: roster.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
    const rosterForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: roster.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
        rosterForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: roster.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\ShiftRosterController::roster
 * @see app/Http/Controllers/ShiftRosterController.php:30
 * @route '/api/schedules/roster'
 */
        rosterForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: roster.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    roster.form = rosterForm
/**
* @see \App\Http\Controllers\ShiftRosterController::assign
 * @see app/Http/Controllers/ShiftRosterController.php:43
 * @route '/api/schedules/roster'
 */
export const assign = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(options),
    method: 'post',
})

assign.definition = {
    methods: ["post"],
    url: '/api/schedules/roster',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShiftRosterController::assign
 * @see app/Http/Controllers/ShiftRosterController.php:43
 * @route '/api/schedules/roster'
 */
assign.url = (options?: RouteQueryOptions) => {
    return assign.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShiftRosterController::assign
 * @see app/Http/Controllers/ShiftRosterController.php:43
 * @route '/api/schedules/roster'
 */
assign.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: assign.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShiftRosterController::assign
 * @see app/Http/Controllers/ShiftRosterController.php:43
 * @route '/api/schedules/roster'
 */
    const assignForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: assign.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShiftRosterController::assign
 * @see app/Http/Controllers/ShiftRosterController.php:43
 * @route '/api/schedules/roster'
 */
        assignForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: assign.url(options),
            method: 'post',
        })
    
    assign.form = assignForm
/**
* @see \App\Http\Controllers\ShiftRosterController::clear
 * @see app/Http/Controllers/ShiftRosterController.php:67
 * @route '/api/schedules/roster/clear'
 */
export const clear = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clear.url(options),
    method: 'post',
})

clear.definition = {
    methods: ["post"],
    url: '/api/schedules/roster/clear',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShiftRosterController::clear
 * @see app/Http/Controllers/ShiftRosterController.php:67
 * @route '/api/schedules/roster/clear'
 */
clear.url = (options?: RouteQueryOptions) => {
    return clear.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShiftRosterController::clear
 * @see app/Http/Controllers/ShiftRosterController.php:67
 * @route '/api/schedules/roster/clear'
 */
clear.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: clear.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShiftRosterController::clear
 * @see app/Http/Controllers/ShiftRosterController.php:67
 * @route '/api/schedules/roster/clear'
 */
    const clearForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: clear.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShiftRosterController::clear
 * @see app/Http/Controllers/ShiftRosterController.php:67
 * @route '/api/schedules/roster/clear'
 */
        clearForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: clear.url(options),
            method: 'post',
        })
    
    clear.form = clearForm
/**
* @see \App\Http\Controllers\ShiftRosterController::copyWeek
 * @see app/Http/Controllers/ShiftRosterController.php:81
 * @route '/api/schedules/roster/copy-week'
 */
export const copyWeek = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: copyWeek.url(options),
    method: 'post',
})

copyWeek.definition = {
    methods: ["post"],
    url: '/api/schedules/roster/copy-week',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\ShiftRosterController::copyWeek
 * @see app/Http/Controllers/ShiftRosterController.php:81
 * @route '/api/schedules/roster/copy-week'
 */
copyWeek.url = (options?: RouteQueryOptions) => {
    return copyWeek.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\ShiftRosterController::copyWeek
 * @see app/Http/Controllers/ShiftRosterController.php:81
 * @route '/api/schedules/roster/copy-week'
 */
copyWeek.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: copyWeek.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\ShiftRosterController::copyWeek
 * @see app/Http/Controllers/ShiftRosterController.php:81
 * @route '/api/schedules/roster/copy-week'
 */
    const copyWeekForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: copyWeek.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\ShiftRosterController::copyWeek
 * @see app/Http/Controllers/ShiftRosterController.php:81
 * @route '/api/schedules/roster/copy-week'
 */
        copyWeekForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: copyWeek.url(options),
            method: 'post',
        })
    
    copyWeek.form = copyWeekForm
const schedules = {
    templates: Object.assign(templates, templates),
roster: Object.assign(roster, roster),
assign: Object.assign(assign, assign),
clear: Object.assign(clear, clear),
copyWeek: Object.assign(copyWeek, copyWeek),
}

export default schedules