import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/payroll-settings/work-schedules',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\PayrollSettingsController::index
 * @see app/Http/Controllers/PayrollSettingsController.php:237
 * @route '/api/payroll-settings/work-schedules'
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
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/work-schedules',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::store
 * @see app/Http/Controllers/PayrollSettingsController.php:242
 * @route '/api/payroll-settings/work-schedules'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
export const update = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/payroll-settings/work-schedules/{workSchedule}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
update.url = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workSchedule: typeof args.workSchedule === 'object'
                ? args.workSchedule.id
                : args.workSchedule,
                }

    return update.definition.url
            .replace('{workSchedule}', parsedArgs.workSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
update.put = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
    const updateForm = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::update
 * @see app/Http/Controllers/PayrollSettingsController.php:250
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
        updateForm.put = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
export const destroy = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/payroll-settings/work-schedules/{workSchedule}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
destroy.url = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workSchedule: typeof args.workSchedule === 'object'
                ? args.workSchedule.id
                : args.workSchedule,
                }

    return destroy.definition.url
            .replace('{workSchedule}', parsedArgs.workSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
destroy.delete = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
    const destroyForm = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::destroy
 * @see app/Http/Controllers/PayrollSettingsController.php:258
 * @route '/api/payroll-settings/work-schedules/{workSchedule}'
 */
        destroyForm.delete = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
/**
* @see \App\Http\Controllers\PayrollSettingsController::employees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
export const employees = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: employees.url(args, options),
    method: 'post',
})

employees.definition = {
    methods: ["post"],
    url: '/api/payroll-settings/work-schedules/{workSchedule}/employees',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\PayrollSettingsController::employees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
employees.url = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { workSchedule: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { workSchedule: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    workSchedule: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        workSchedule: typeof args.workSchedule === 'object'
                ? args.workSchedule.id
                : args.workSchedule,
                }

    return employees.definition.url
            .replace('{workSchedule}', parsedArgs.workSchedule.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\PayrollSettingsController::employees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
employees.post = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: employees.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\PayrollSettingsController::employees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
    const employeesForm = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: employees.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\PayrollSettingsController::employees
 * @see app/Http/Controllers/PayrollSettingsController.php:279
 * @route '/api/payroll-settings/work-schedules/{workSchedule}/employees'
 */
        employeesForm.post = (args: { workSchedule: number | { id: number } } | [workSchedule: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: employees.url(args, options),
            method: 'post',
        })
    
    employees.form = employeesForm
const workSchedules = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
employees: Object.assign(employees, employees),
}

export default workSchedules