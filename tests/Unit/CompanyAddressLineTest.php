<?php

use App\Models\Company;

/** The profile form stores each address as an array, so the PDFs print the one-line form below. */
test('the address line joins the filled parts and adds the country only when something else is set', function () {
    $company = new Company(['registered_address' => ['building_unit' => '', 'street' => '1 Test Street', 'barangay' => '', 'city' => 'Makati City', 'province' => 'Metro Manila', 'region' => '', 'zip_code' => '1200', 'country' => 'Philippines']]);
    expect($company->addressLine())->toBe('1 Test Street, Makati City, Metro Manila, 1200, Philippines');

    // The form fills the country in by default, so a profile with only that has no address.
    $empty = new Company(['registered_address' => ['street' => '', 'city' => '', 'country' => 'Philippines'], 'office_address' => ['street' => '', 'country' => 'Philippines']]);
    expect($empty->addressLine())->toBe('')->and((new Company)->addressLine())->toBe('');
});

test('the office address is used when the registered one is empty', function () {
    $office = new Company(['registered_address' => ['street' => '', 'country' => 'Philippines'], 'office_address' => ['street' => '2 Office Road', 'city' => 'Pasig City', 'country' => 'Philippines']]);
    expect($office->addressLine())->toBe('2 Office Road, Pasig City, Philippines');
});
