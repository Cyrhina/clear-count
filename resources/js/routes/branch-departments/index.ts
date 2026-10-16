import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/branch-departments',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\BranchDepartmentController::index
 * @see app/Http/Controllers/BranchDepartmentController.php:27
 * @route '/api/branch-departments'
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
* @see \App\Http\Controllers\BranchDepartmentController::store
 * @see app/Http/Controllers/BranchDepartmentController.php:35
 * @route '/api/branch-departments'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/branch-departments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BranchDepartmentController::store
 * @see app/Http/Controllers/BranchDepartmentController.php:35
 * @route '/api/branch-departments'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchDepartmentController::store
 * @see app/Http/Controllers/BranchDepartmentController.php:35
 * @route '/api/branch-departments'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BranchDepartmentController::store
 * @see app/Http/Controllers/BranchDepartmentController.php:35
 * @route '/api/branch-departments'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchDepartmentController::store
 * @see app/Http/Controllers/BranchDepartmentController.php:35
 * @route '/api/branch-departments'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\BranchDepartmentController::copy
 * @see app/Http/Controllers/BranchDepartmentController.php:46
 * @route '/api/branch-departments/copy'
 */
export const copy = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: copy.url(options),
    method: 'post',
})

copy.definition = {
    methods: ["post"],
    url: '/api/branch-departments/copy',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BranchDepartmentController::copy
 * @see app/Http/Controllers/BranchDepartmentController.php:46
 * @route '/api/branch-departments/copy'
 */
copy.url = (options?: RouteQueryOptions) => {
    return copy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchDepartmentController::copy
 * @see app/Http/Controllers/BranchDepartmentController.php:46
 * @route '/api/branch-departments/copy'
 */
copy.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: copy.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\BranchDepartmentController::copy
 * @see app/Http/Controllers/BranchDepartmentController.php:46
 * @route '/api/branch-departments/copy'
 */
    const copyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: copy.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchDepartmentController::copy
 * @see app/Http/Controllers/BranchDepartmentController.php:46
 * @route '/api/branch-departments/copy'
 */
        copyForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: copy.url(options),
            method: 'post',
        })
    
    copy.form = copyForm
/**
* @see \App\Http\Controllers\BranchDepartmentController::update
 * @see app/Http/Controllers/BranchDepartmentController.php:60
 * @route '/api/branch-departments/{department}'
 */
export const update = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/api/branch-departments/{department}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BranchDepartmentController::update
 * @see app/Http/Controllers/BranchDepartmentController.php:60
 * @route '/api/branch-departments/{department}'
 */
update.url = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { department: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { department: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    department: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        department: typeof args.department === 'object'
                ? args.department.id
                : args.department,
                }

    return update.definition.url
            .replace('{department}', parsedArgs.department.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchDepartmentController::update
 * @see app/Http/Controllers/BranchDepartmentController.php:60
 * @route '/api/branch-departments/{department}'
 */
update.put = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BranchDepartmentController::update
 * @see app/Http/Controllers/BranchDepartmentController.php:60
 * @route '/api/branch-departments/{department}'
 */
    const updateForm = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchDepartmentController::update
 * @see app/Http/Controllers/BranchDepartmentController.php:60
 * @route '/api/branch-departments/{department}'
 */
        updateForm.put = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\BranchDepartmentController::destroy
 * @see app/Http/Controllers/BranchDepartmentController.php:73
 * @route '/api/branch-departments/{department}'
 */
export const destroy = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/branch-departments/{department}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\BranchDepartmentController::destroy
 * @see app/Http/Controllers/BranchDepartmentController.php:73
 * @route '/api/branch-departments/{department}'
 */
destroy.url = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { department: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { department: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    department: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        department: typeof args.department === 'object'
                ? args.department.id
                : args.department,
                }

    return destroy.definition.url
            .replace('{department}', parsedArgs.department.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchDepartmentController::destroy
 * @see app/Http/Controllers/BranchDepartmentController.php:73
 * @route '/api/branch-departments/{department}'
 */
destroy.delete = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\BranchDepartmentController::destroy
 * @see app/Http/Controllers/BranchDepartmentController.php:73
 * @route '/api/branch-departments/{department}'
 */
    const destroyForm = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchDepartmentController::destroy
 * @see app/Http/Controllers/BranchDepartmentController.php:73
 * @route '/api/branch-departments/{department}'
 */
        destroyForm.delete = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\BranchDepartmentController::supervisor
 * @see app/Http/Controllers/BranchDepartmentController.php:87
 * @route '/api/branch-departments/{department}/supervisor'
 */
export const supervisor = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: supervisor.url(args, options),
    method: 'put',
})

supervisor.definition = {
    methods: ["put"],
    url: '/api/branch-departments/{department}/supervisor',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\BranchDepartmentController::supervisor
 * @see app/Http/Controllers/BranchDepartmentController.php:87
 * @route '/api/branch-departments/{department}/supervisor'
 */
supervisor.url = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { department: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { department: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    department: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        department: typeof args.department === 'object'
                ? args.department.id
                : args.department,
                }

    return supervisor.definition.url
            .replace('{department}', parsedArgs.department.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\BranchDepartmentController::supervisor
 * @see app/Http/Controllers/BranchDepartmentController.php:87
 * @route '/api/branch-departments/{department}/supervisor'
 */
supervisor.put = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: supervisor.url(args, options),
    method: 'put',
})

    /**
* @see \App\Http\Controllers\BranchDepartmentController::supervisor
 * @see app/Http/Controllers/BranchDepartmentController.php:87
 * @route '/api/branch-departments/{department}/supervisor'
 */
    const supervisorForm = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: supervisor.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\BranchDepartmentController::supervisor
 * @see app/Http/Controllers/BranchDepartmentController.php:87
 * @route '/api/branch-departments/{department}/supervisor'
 */
        supervisorForm.put = (args: { department: number | { id: number } } | [department: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: supervisor.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    supervisor.form = supervisorForm
const branchDepartments = {
    index: Object.assign(index, index),
store: Object.assign(store, store),
copy: Object.assign(copy, copy),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
supervisor: Object.assign(supervisor, supervisor),
}

export default branchDepartments