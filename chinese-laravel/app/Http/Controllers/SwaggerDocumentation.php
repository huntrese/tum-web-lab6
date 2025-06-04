<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use OpenApi\Annotations as OA;

/**
 * @OA\OpenApi(
 *     @OA\Info(
 *         version="1.0.0",
 *         title="Chinese Learning API",
 *         description="API endpoints for user authentication, translation, and user management"
 *     ),
 *     @OA\Server(
 *         description="Local API server",
 *         url="http://localhost:8000"
 *     ),
 *     @OA\Components(
 *         @OA\SecurityScheme(
 *             securityScheme="bearerAuth",
 *             type="http",
 *             scheme="bearer",
 *             bearerFormat="JWT"
 *         )
 *     )
 * )
 */
class SwaggerDocumentation extends Controller {
}