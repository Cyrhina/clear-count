<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

/** The request is fine but the record is no longer in a state it can apply to (already decided ...). Answers 409. */
class ConflictException extends Exception
{
    public function render(): JsonResponse
    {
        return response()->json(['message' => $this->getMessage()], 409);
    }
}
