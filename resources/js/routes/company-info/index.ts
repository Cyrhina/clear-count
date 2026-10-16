import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import logo from './logo'
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/api/company-info',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
    const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: show.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
 */
        showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: show.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\CompanyInfoController::show
 * @see app/Http/Controllers/CompanyInfoController.php:21
 * @route '/api/company-info'
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
/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})

update.definition = {
    methods: ["put","post"],
    url: '/api/company-info',
} satisfies RouteDefinition<["put","post"]>

/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
update.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
update.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: update.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
    const updateForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: update.url({
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PUT',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
        updateForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PUT',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
            /**
* @see \App\Http\Controllers\CompanyInfoController::update
 * @see app/Http/Controllers/CompanyInfoController.php:27
 * @route '/api/company-info'
 */
        updateForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: update.url(options),
            method: 'post',
        })
    
    update.form = updateForm
const companyInfo = {
    show: Object.assign(show, show),
update: Object.assign(update, update),
logo: Object.assign(logo, logo),
}

export default companyInfo