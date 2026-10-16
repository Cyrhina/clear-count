import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
export const companies = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companies.url(options),
    method: 'get',
})

companies.definition = {
    methods: ["get","head"],
    url: '/platform/companies',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
companies.url = (options?: RouteQueryOptions) => {
    return companies.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
companies.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: companies.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
companies.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: companies.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
    const companiesForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: companies.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
        companiesForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companies.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\OpsController::companies
 * @see app/Http/Controllers/OpsController.php:216
 * @route '/platform/companies'
 */
        companiesForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: companies.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    companies.form = companiesForm
const platform = {
    companies: Object.assign(companies, companies),
}

export default platform