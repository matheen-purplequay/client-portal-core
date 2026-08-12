<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ExcelExport implements FromCollection, WithHeadings
{    
    protected $data;
    protected $columns;
    protected $headers;

    public function __construct(array $data, array $columns, array $headers)
    {
        $this->data = $data;
        $this->columns = $columns;
        $this->headers = $headers;
    }

    public function collection()
    {
        // Convert each object to an array and filter columns
        $dataArray = array_map(function ($item) {
            return array_intersect_key((array) $item, array_flip($this->columns));
        }, $this->data);

        // Create a collection from the array data
        return new Collection($dataArray);
    }

    public function headings(): array
    {
        return $this->headers;
    }
}
