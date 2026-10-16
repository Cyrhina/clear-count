import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
const index043c6eb7c411218f75b85d09cc232406 = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index043c6eb7c411218f75b85d09cc232406.url(options),
    method: 'get',
})

index043c6eb7c411218f75b85d09cc232406.definition = {
    methods: ["get","head"],
    url: '/api/v1/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
index043c6eb7c411218f75b85d09cc232406.url = (options?: RouteQueryOptions) => {
    return index043c6eb7c411218f75b85d09cc232406.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
index043c6eb7c411218f75b85d09cc232406.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index043c6eb7c411218f75b85d09cc232406.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
index043c6eb7c411218f75b85d09cc232406.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index043c6eb7c411218f75b85d09cc232406.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
    const index043c6eb7c411218f75b85d09cc232406Form = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index043c6eb7c411218f75b85d09cc232406.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
        index043c6eb7c411218f75b85d09cc232406Form.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index043c6eb7c411218f75b85d09cc232406.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/v1/payroll'
 */
        index043c6eb7c411218f75b85d09cc232406Form.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index043c6eb7c411218f75b85d09cc232406.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index043c6eb7c411218f75b85d09cc232406.form = index043c6eb7c411218f75b85d09cc232406Form
    /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
const index6b0c3b963980c50e6d63eaae1ed67d1c = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index6b0c3b963980c50e6d63eaae1ed67d1c.url(options),
    method: 'get',
})

index6b0c3b963980c50e6d63eaae1ed67d1c.definition = {
    methods: ["get","head"],
    url: '/api/payroll',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
index6b0c3b963980c50e6d63eaae1ed67d1c.url = (options?: RouteQueryOptions) => {
    return index6b0c3b963980c50e6d63eaae1ed67d1c.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
index6b0c3b963980c50e6d63eaae1ed67d1c.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index6b0c3b963980c50e6d63eaae1ed67d1c.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
index6b0c3b963980c50e6d63eaae1ed67d1c.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index6b0c3b963980c50e6d63eaae1ed67d1c.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
    const index6b0c3b963980c50e6d63eaae1ed67d1cForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index6b0c3b963980c50e6d63eaae1ed67d1c.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
        index6b0c3b963980c50e6d63eaae1ed67d1cForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index6b0c3b963980c50e6d63eaae1ed67d1c.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::index
 * @see app/Http/Controllers/PayrollController.php:22
 * @route '/api/payroll'
 */
        index6b0c3b963980c50e6d63eaae1ed67d1cForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index6b0c3b963980c50e6d63eaae1ed67d1c.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index6b0c3b963980c50e6d63eaae1ed67d1c.form = index6b0c3b963980c50e6d63eaae1ed67d1cForm

/**
* Multiple routes resolve to \App\Http\Controllers\PayrollController::index, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `index['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const index = {
    '/api/v1/payroll': index043c6eb7c411218f75b85d09cc232406,
    '/api/payroll': index6b0c3b963980c50e6d63eaae1ed67d1c,
}

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
const lines2259b6838bb374aa138900d54f9888ef = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines2259b6838bb374aa138900d54f9888ef.url(args, options),
    method: 'get',
})

lines2259b6838bb374aa138900d54f9888ef.definition = {
    methods: ["get","head"],
    url: '/api/v1/payroll/{period}/lines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
lines2259b6838bb374aa138900d54f9888ef.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return lines2259b6838bb374aa138900d54f9888ef.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
lines2259b6838bb374aa138900d54f9888ef.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines2259b6838bb374aa138900d54f9888ef.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
lines2259b6838bb374aa138900d54f9888ef.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lines2259b6838bb374aa138900d54f9888ef.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
    const lines2259b6838bb374aa138900d54f9888efForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lines2259b6838bb374aa138900d54f9888ef.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
        lines2259b6838bb374aa138900d54f9888efForm.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines2259b6838bb374aa138900d54f9888ef.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/v1/payroll/{period}/lines'
 */
        lines2259b6838bb374aa138900d54f9888efForm.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines2259b6838bb374aa138900d54f9888ef.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lines2259b6838bb374aa138900d54f9888ef.form = lines2259b6838bb374aa138900d54f9888efForm
    /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
const lines840d5c05e0799b4c1732d9491d5ff39c = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines840d5c05e0799b4c1732d9491d5ff39c.url(args, options),
    method: 'get',
})

lines840d5c05e0799b4c1732d9491d5ff39c.definition = {
    methods: ["get","head"],
    url: '/api/payroll/{period}/lines',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
lines840d5c05e0799b4c1732d9491d5ff39c.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return lines840d5c05e0799b4c1732d9491d5ff39c.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
lines840d5c05e0799b4c1732d9491d5ff39c.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: lines840d5c05e0799b4c1732d9491d5ff39c.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
lines840d5c05e0799b4c1732d9491d5ff39c.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: lines840d5c05e0799b4c1732d9491d5ff39c.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
    const lines840d5c05e0799b4c1732d9491d5ff39cForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: lines840d5c05e0799b4c1732d9491d5ff39c.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
        lines840d5c05e0799b4c1732d9491d5ff39cForm.get = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines840d5c05e0799b4c1732d9491d5ff39c.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::lines
 * @see app/Http/Controllers/PayrollController.php:70
 * @route '/api/payroll/{period}/lines'
 */
        lines840d5c05e0799b4c1732d9491d5ff39cForm.head = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: lines840d5c05e0799b4c1732d9491d5ff39c.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    lines840d5c05e0799b4c1732d9491d5ff39c.form = lines840d5c05e0799b4c1732d9491d5ff39cForm

/**
* Multiple routes resolve to \App\Http\Controllers\PayrollController::lines, so this export is a
* dictionary keyed by URI rather than a callable. Call a specific route with `lines['<uri>'](...)`,
* or import the route by name from your generated `routes/` directory.
*/
export const lines = {
    '/api/v1/payroll/{period}/lines': lines2259b6838bb374aa138900d54f9888ef,
    '/api/payroll/{period}/lines': lines840d5c05e0799b4c1732d9491d5ff39c,
}

/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
export const employees = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})

employees.definition = {
    methods: ["get","head"],
    url: '/api/payroll/employees',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
employees.url = (options?: RouteQueryOptions) => {
    return employees.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
employees.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: employees.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
employees.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: employees.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
    const employeesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: employees.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
 */
        employeesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: employees.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::employees
 * @see app/Http/Controllers/PayrollController.php:28
 * @route '/api/payroll/employees'
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
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
export const nextNumber = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nextNumber.url(options),
    method: 'get',
})

nextNumber.definition = {
    methods: ["get","head"],
    url: '/api/payroll/next-number',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
nextNumber.url = (options?: RouteQueryOptions) => {
    return nextNumber.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
nextNumber.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: nextNumber.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
nextNumber.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: nextNumber.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
    const nextNumberForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: nextNumber.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
        nextNumberForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: nextNumber.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::nextNumber
 * @see app/Http/Controllers/PayrollController.php:39
 * @route '/api/payroll/next-number'
 */
        nextNumberForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: nextNumber.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    nextNumber.form = nextNumberForm
/**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
export const line = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: line.url(args, options),
    method: 'get',
})

line.definition = {
    methods: ["get","head"],
    url: '/api/payroll/lines/{line}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
line.url = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { line: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { line: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    line: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        line: typeof args.line === 'object'
                ? args.line.id
                : args.line,
                }

    return line.definition.url
            .replace('{line}', parsedArgs.line.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
line.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: line.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
line.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: line.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
    const lineForm = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: line.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
        lineForm.get = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: line.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollController::line
 * @see app/Http/Controllers/PayrollController.php:75
 * @route '/api/payroll/lines/{line}'
 */
        lineForm.head = (args: { line: number | { id: number } } | [line: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: line.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    line.form = lineForm
/**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::store
 * @see app/Http/Controllers/PayrollController.php:46
 * @route '/api/payroll'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
export const run = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

run.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/run',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
run.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return run.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
run.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: run.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
    const runForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: run.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::run
 * @see app/Http/Controllers/PayrollController.php:80
 * @route '/api/payroll/{period}/run'
 */
        runForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: run.url(args, options),
            method: 'post',
        })
    
    run.form = runForm
/**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
export const hold = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hold.url(args, options),
    method: 'post',
})

hold.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/hold',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
hold.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return hold.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
hold.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: hold.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
    const holdForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: hold.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::hold
 * @see app/Http/Controllers/PayrollController.php:88
 * @route '/api/payroll/{period}/hold'
 */
        holdForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: hold.url(args, options),
            method: 'post',
        })
    
    hold.form = holdForm
/**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
export const release = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: release.url(args, options),
    method: 'post',
})

release.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/release',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
release.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return release.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
release.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: release.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
    const releaseForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: release.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::release
 * @see app/Http/Controllers/PayrollController.php:96
 * @route '/api/payroll/{period}/release'
 */
        releaseForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: release.url(args, options),
            method: 'post',
        })
    
    release.form = releaseForm
/**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
export const approve = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
approve.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return approve.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
approve.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
    const approveForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: approve.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::approve
 * @see app/Http/Controllers/PayrollController.php:104
 * @route '/api/payroll/{period}/approve'
 */
        approveForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: approve.url(args, options),
            method: 'post',
        })
    
    approve.form = approveForm
/**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
export const finalize = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finalize.url(args, options),
    method: 'post',
})

finalize.definition = {
    methods: ["post"],
    url: '/api/payroll/{period}/finalize',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
finalize.url = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { period: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { period: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    period: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        period: typeof args.period === 'object'
                ? args.period.id
                : args.period,
                }

    return finalize.definition.url
            .replace('{period}', parsedArgs.period.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
finalize.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: finalize.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
    const finalizeForm = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: finalize.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollController::finalize
 * @see app/Http/Controllers/PayrollController.php:112
 * @route '/api/payroll/{period}/finalize'
 */
        finalizeForm.post = (args: { period: number | { id: number } } | [period: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: finalize.url(args, options),
            method: 'post',
        })
    
    finalize.form = finalizeForm
const PayrollController = { index, lines, employees, nextNumber, line, store, run, hold, release, approve, finalize }

export default PayrollController