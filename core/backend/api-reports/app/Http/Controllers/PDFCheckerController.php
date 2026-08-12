<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;
use \Smalot\PdfParser\Parser;

class PDFCheckerController extends Controller
{
    public function checkPDFClient(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|mimes:pdf|max:5048',
        ]);

        // Get the uploaded file
        $pdfFile = $request->file('file');
        $code = preg_quote($request->input('code'), '/');
        $checkForCode = '/' . $code . '\s+Monthly/i';
        // $checkForCode = '/' . $code . '\s*[/\\]?\s*Monthly/i';
        // $checkForCode = '/' . $code . '(?:\s*[/\\\\]?\s*)Monthly/i'; 

        $checkForPQCode = '/Monthly Client Connect Report for ' . $code . '/i';

        // Parse the PDF file
        $parser = new Parser();
        $pdf = $parser->parseFile($pdfFile->getPathname());

        // Extract text from the PDF
        $text = $pdf->getText();

        try {
            // Find the code in the text
            if (preg_match($checkForCode, $text, $matches)) {
                $code = $matches[0];
                return ['status' => true, 'message' => 'Match found'];
            } elseif(preg_match($checkForPQCode, $text, $matches)) {
                $code = $matches[0];
                return ['status' => true, 'message' => 'Match found'];
            } else {
                $code = 'Code not found';
                return ['status' => false, 'message' => 'Match not found', 'error_type' => 'invalid'];
            }
        } catch(Exception $e) {
            return ['status' => false, 'message' => 'Something went wrong', 'error' => $e->getMessage(), 'error_type' => 'error', 'code' => $checkForCode];
        }
    }
}
    