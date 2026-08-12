@props(['status', 'message'])

@if ($status == 'true')
    <div {{ $attributes->merge(['class' => 'font-medium text-sm text-green-600']) }}>
        {{ $message }}
    </div>
@endif
@if ($status == 'false')
    <div {{ $attributes->merge(['class' => 'font-medium text-sm text-red-600']) }}>
        {{ $message }}
    </div>
@endif
