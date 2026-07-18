<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
</script>

<a href={resolve(localizeHref('/demo/better-auth') as Pathname)}>better-auth</a>
<a href={resolve(localizeHref('/demo/playwright') as Pathname)}>playwright</a>
