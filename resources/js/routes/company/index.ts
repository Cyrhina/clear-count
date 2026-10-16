import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/company',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company'
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
const company = {
    show: Object.assign(show, show),
}

export default company