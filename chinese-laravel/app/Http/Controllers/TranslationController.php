<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Overtrue\Pinyin\Pinyin;
use Stichoza\GoogleTranslate\GoogleTranslate;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(
 *     name="Translation",
 *     description="API Endpoints for Chinese translation and pinyin conversion"
 * )
 */
class TranslationController extends Controller
{
    protected $pinyin;
    protected $translator;

    public function __construct()
    {
        $this->pinyin = new Pinyin();
        $this->translator = new GoogleTranslate();
        $this->translator->setSource('en')->setTarget('zh');
    }

    /**
     * @OA\Post(
     *     path="/api/translate/to-chinese",
     *     summary="Translate English text to Chinese",
     *     tags={"Translation"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"text"},
     *             @OA\Property(property="text", type="string", example="Hello")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful translation",
     *         @OA\JsonContent(
     *             @OA\Property(property="translation", type="string", example="你好"),
     *             @OA\Property(property="pinyin", type="string", example="ni hao")
     *         )
     *     )
     * )
     */
    public function translateToChinese(Request $request)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        try {
            $chinese = $this->translator->translate($request->text);
            $pinyin = $this->pinyin->sentence($chinese);

            return response()->json([
                'translation' => $chinese,
                'pinyin' => $pinyin
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Translation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/translate/to-english",
     *     summary="Translate Chinese text to English",
     *     tags={"Translation"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"text"},
     *             @OA\Property(property="text", type="string", example="你好")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful translation",
     *         @OA\JsonContent(
     *             @OA\Property(property="translation", type="string", example="Hello"),
     *             @OA\Property(property="pinyin", type="string", example="ni hao")
     *         )
     *     )
     * )
     */
    public function translateToEnglish(Request $request)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        try {
            $this->translator->setSource('zh')->setTarget('en');
            $english = $this->translator->translate($request->text);
            $pinyin = $this->pinyin->sentence($request->text);

            return response()->json([
                'translation' => $english,
                'pinyin' => $pinyin
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Translation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/pinyin",
     *     summary="Convert Chinese text to pinyin",
     *     tags={"Translation"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"text"},
     *             @OA\Property(property="text", type="string", example="你好")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Successful conversion",
     *         @OA\JsonContent(
     *             @OA\Property(property="pinyin", type="string", example="ni hao")
     *         )
     *     )
     * )
     */
    public function getPinyin(Request $request)
    {
        $request->validate([
            'text' => 'required|string'
        ]);

        try {
            $pinyin = $this->pinyin->sentence($request->text);
            return response()->json([
                'pinyin' => $pinyin
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Pinyin conversion failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
