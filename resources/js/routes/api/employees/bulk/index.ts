import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\EmployeeBulkController::department
 * @see app/Http/Controllers/EmployeeBulkController.php:77
 * @route '/api/employees/bulk/department'
 */
export const department = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: department.url(options),
    method: 'post',
})

department.definition = {
    methods: ["post"],
    url: '/api/employees/bulk/department',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeBulkController::department
 * @see app/Http/Controllers/EmployeeBulkController.php:77
 * @route '/api/employees/bulk/department'
 */
department.url = (options?: RouteQueryOptions) => {
    return department.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeBulkController::department
 * @see app/Http/Controllers/EmployeeBulkController.php:77
 * @route '/api/employees/bulk/department'
 */
department.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: department.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeBulkController::department
 * @see app/Http/Controllers/EmployeeBulkController.php:77
 * @route '/api/employees/bulk/department'
 */
    const departmentForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: department.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeBulkController::department
 * @see app/Http/Controllers/EmployeeBulkController.php:77
 * @route '/api/employees/bulk/department'
 */
        departmentForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: department.url(options),
            method: 'post',
        })
    
    department.form = departmentForm
/**
* @see \App\Http\Controllers\EmployeeBulkController::branch
 * @see app/Http/Controllers/EmployeeBulkController.php:96
 * @route '/api/employees/bulk/branch'
 */
export const branch = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: branch.url(options),
    method: 'post',
})

branch.definition = {
    methods: ["post"],
    url: '/api/employees/bulk/branch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeBulkController::branch
 * @see app/Http/Controllers/EmployeeBulkController.php:96
 * @route '/api/employees/bulk/branch'
 */
branch.url = (options?: RouteQueryOptions) => {
    return branch.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeBulkController::branch
 * @see app/Http/Controllers/EmployeeBulkController.php:96
 * @route '/api/employees/bulk/branch'
 */
branch.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: branch.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeBulkController::branch
 * @see app/Http/Controllers/EmployeeBulkController.php:96
 * @route '/api/employees/bulk/branch'
 */
    const branchForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: branch.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeBulkController::branch
 * @see app/Http/Controllers/EmployeeBulkController.php:96
 * @route '/api/employees/bulk/branch'
 */
        branchForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: branch.url(options),
            method: 'post',
        })
    
    branch.form = branchForm
/**
* @see \App\Http\Controllers\EmployeeBulkController::status
 * @see app/Http/Controllers/EmployeeBulkController.php:115
 * @route '/api/employees/bulk/status'
 */
export const status = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

status.definition = {
    methods: ["post"],
    url: '/api/employees/bulk/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\EmployeeBulkController::status
 * @see app/Http/Controllers/EmployeeBulkController.php:115
 * @route '/api/employees/bulk/status'
 */
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\EmployeeBulkController::status
 * @see app/Http/Controllers/EmployeeBulkController.php:115
 * @route '/api/employees/bulk/status'
 */
status.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: status.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\EmployeeBulkController::status
 * @see app/Http/Controllers/EmployeeBulkController.php:115
 * @route '/api/employees/bulk/status'
 */
    const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\EmployeeBulkController::status
 * @see app/Http/Controllers/EmployeeBulkController.php:115
 * @route '/api/employees/bulk/status'
 */
        statusForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(options),
            method: 'post',
        })
    
    status.form = statusForm
const bulk = {
    department: Object.assign(department, department),
branch: Object.assign(branch, branch),
status: Object.assign(status, status),
}

export default bulk