<?php
/**
 * Removes competitor branding from AI-generated site content.
 *
 * @package WPPluginWeb
 */

namespace Web;

/**
 * Strips Bluehost links out of the block markup produced by the AI SiteGen flow.
 *
 * The footer patterns WonderBlocks serves (patterns.hiive.cloud) hard-code a Bluehost
 * affiliate credit line, e.g.
 *
 *     <p>&copy; 2026. <a href="https://bluehost.com/wordpress-hosting?...">Powered by Bluehost</a>.</p>
 *
 * The brand never reaches the service that returns those patterns: `SiteGen::get_brand()` in
 * wp-module-ai attaches the `X-Newfold-Brand` header only to the `NFD_AI_BASE` requests, not to
 * the `NFD_CONTENT_GENERATION_BASE . 'page'` requests that return `generatedPatterns`. So it has
 * no way to know it is serving a Network Solutions site and always answers with Bluehost markup.
 *
 * The markup does not stay in the onboarding preview either — the selected footer is written to
 * the active theme's `footer` template part, so a finished site ships the link in its footer.
 *
 * Until this is fixed upstream, scrub the markup on the way into the database. The copyright text
 * up to its year is kept, so the footer keeps its layout, and the link goes along with whatever
 * followed it.
 */
class SiteGenBrandScrub {

	/**
	 * Onboarding state options that can hold generated block markup.
	 *
	 * @var string[]
	 */
	private const STATE_OPTIONS = [
		'nfd_module_onboarding_state_sitegen',
		'nfd_module_onboarding_state_blueprints',
	];

	/**
	 * Post types the onboarding flow owns outright, where all content is generated.
	 *
	 * @var string[]
	 */
	private const GENERATED_POST_TYPES = [ 'wp_template', 'wp_template_part' ];

	/**
	 * Post types the onboarding flow shares with hand-authored content. Sitegen publishes its
	 * previews and the finished homepage as pages, so these are scrubbed only when the markup
	 * carries a WonderBlocks marker — an author writing about Bluehost keeps their own link.
	 *
	 * @var string[]
	 */
	private const AUTHORED_POST_TYPES = [ 'page', 'post' ];

	/**
	 * Markers identifying block markup that came from WonderBlocks rather than from an author.
	 *
	 * @var string[]
	 */
	private const GENERATED_MARKERS = [ 'nfd-wb-', 'utm_source=wonderblocks' ];

	/**
	 * Host whose links must never appear on a Network Solutions / Web.com site.
	 *
	 * @var string
	 */
	private const BLOCKED_HOST = 'bluehost.com';

	/**
	 * Register the filters.
	 */
	public static function init(): void {
		foreach ( self::STATE_OPTIONS as $option_name ) {
			add_filter( "pre_update_option_{$option_name}", [ __CLASS__, 'filter_option' ] );
		}

		add_filter( 'wp_insert_post_data', [ __CLASS__, 'filter_post_data' ], 10, 2 );
	}

	/**
	 * Scrub an onboarding state option before it is stored.
	 *
	 * @param mixed $value The option value about to be written.
	 *
	 * @return mixed
	 */
	public static function filter_option( $value ) {
		return self::scrub_recursive( $value );
	}

	/**
	 * Scrub generated block markup out of post content before it is written.
	 *
	 * WordPress passes slashed data to this filter and unslashes it afterwards, so unslash
	 * around the rewrite. `PreviewsService::publish_page()` calls `remove_all_actions()` on
	 * `wp_insert_post` and `save_post`, neither of which affects this filter.
	 *
	 * @param array $data    Sanitized, slashed post data about to be written.
	 * @param array $postarr Post data as passed to wp_insert_post().
	 *
	 * @return array
	 */
	public static function filter_post_data( array $data, array $postarr ): array {
		if ( ! isset( $data['post_content'] ) || ! is_string( $data['post_content'] ) ) {
			return $data;
		}

		$post_type = $data['post_type'] ?? $postarr['post_type'] ?? '';
		$content   = (string) wp_unslash( $data['post_content'] );

		if ( in_array( $post_type, self::AUTHORED_POST_TYPES, true ) ) {
			if ( ! self::is_generated( $content ) ) {
				return $data;
			}
		} elseif ( ! in_array( $post_type, self::GENERATED_POST_TYPES, true ) ) {
			return $data;
		}

		$scrubbed = self::scrub( $content );

		if ( $scrubbed !== $content ) {
			$data['post_content'] = wp_slash( $scrubbed );
		}

		return $data;
	}

	/**
	 * Remove blocked-host links from a block-markup string.
	 *
	 * @param string $content Block markup.
	 */
	public static function scrub( string $content ): string {
		if ( false === stripos( $content, self::BLOCKED_HOST ) ) {
			return $content;
		}

		/*
		 * Handle paragraphs first, so the copyright text wrapped around a credit link can be
		 * tidied up rather than left with the punctuation the link used to sit between.
		 */
		$content = (string) preg_replace_callback(
			'#(<p\b[^>]*>)(.*?)(</p>)#is',
			[ __CLASS__, 'scrub_paragraph' ],
			$content
		);

		// Anything left outside a paragraph (buttons, standalone links) just loses the link.
		return self::remove_blocked_links( $content );
	}

	/**
	 * Does this markup look like it came out of WonderBlocks rather than an author?
	 *
	 * @param string $content Block markup.
	 */
	private static function is_generated( string $content ): bool {
		foreach ( self::GENERATED_MARKERS as $marker ) {
			if ( false !== stripos( $content, $marker ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Walk an arbitrarily nested option value, scrubbing every string it holds.
	 *
	 * @param mixed $value The value to walk.
	 *
	 * @return mixed
	 */
	private static function scrub_recursive( $value ) {
		if ( is_string( $value ) ) {
			return self::scrub( $value );
		}

		if ( is_array( $value ) ) {
			return array_map( [ __CLASS__, 'scrub_recursive' ], $value );
		}

		return $value;
	}

	/**
	 * Rewrite a single paragraph that carries a blocked-host link.
	 *
	 * The copyright text that led up to the link is kept; the link and everything after it goes.
	 *
	 * @param array $matches Open tag, contents and close tag of one paragraph.
	 */
	private static function scrub_paragraph( array $matches ): string {
		if ( false === stripos( $matches[2], self::BLOCKED_HOST ) ) {
			return $matches[0];
		}

		return $matches[1] . self::keep_copyright_prefix( $matches[2] ) . $matches[3];
	}

	/**
	 * Drop `<a>` elements pointing at the blocked host, link text included.
	 *
	 * @param string $html Markup to clean.
	 */
	private static function remove_blocked_links( string $html ): string {
		$host = preg_quote( self::BLOCKED_HOST, '#' );

		return (string) preg_replace(
			'#<a\b[^>]*href\s*=\s*([\'"])[^\'"]*' . $host . '[^\'"]*\1[^>]*>.*?</a>#is',
			'',
			$html
		);
	}

	/**
	 * Reduce a paragraph to the copyright text that led up to the blocked link.
	 *
	 * Everything from the link onwards is dropped, then the remainder is cut to the end of its
	 * first year. Trying to repair the punctuation around a removed link instead means guessing
	 * at layouts we have not seen — `2026 |`, `2026 -`, `2026 .` all read badly — whereas
	 * anchoring on the year cannot leave a separator dangling whatever the pattern looked like.
	 *
	 *     &copy; Copyright 2026 <a href="https://bluehost.com/...">Bluehost</a>.  ->  &copy; Copyright 2026
	 *     &copy; 2024 - 2026 | <a href="https://bluehost.com/...">Bluehost</a>    ->  &copy; 2024 - 2026
	 *
	 * With no year to anchor on there is no copyright fragment to keep, so fall back to the text
	 * before the link, minus the credit phrase the link used to complete and any trailing
	 * separator. `force_balance_tags()` closes markup the truncation may have cut through.
	 *
	 * @param string $inner Paragraph contents, link included.
	 */
	private static function keep_copyright_prefix( string $inner ): string {
		$inner = (string) preg_replace( '#\s+#', ' ', $inner );
		$inner = self::truncate_at_blocked_link( $inner );

		if ( preg_match( '#^.*?\b\d{4}(?:\s*[-–—]\s*\d{4})?#u', $inner, $matches ) ) {
			$inner = $matches[0];
		} else {
			// "Hosted by " -> "" — the phrase only made sense with the link that followed it.
			$inner = (string) preg_replace(
				'#\b(?:powered|designed|built|hosted|made)\s+by\s*$#i',
				'',
				$inner
			);

			// "&copy; Acme | " -> "&copy; Acme" — the separator has nothing left to separate.
			$inner = (string) preg_replace( '#[\s|/•·,;:–—-]+$#u', '', $inner );
		}

		$inner = trim( force_balance_tags( $inner ) );

		// If only punctuation survived, empty the paragraph rather than leave a stray mark.
		if ( ! preg_match( '#[\p{L}\p{N}]#u', wp_strip_all_tags( $inner ) ) ) {
			return '';
		}

		return $inner;
	}

	/**
	 * Cut a string at the first link pointing to the blocked host.
	 *
	 * @param string $html Markup to truncate.
	 */
	private static function truncate_at_blocked_link( string $html ): string {
		$host = preg_quote( self::BLOCKED_HOST, '#' );

		$found = preg_match(
			'#<a\b[^>]*href\s*=\s*([\'"])[^\'"]*' . $host . '[^\'"]*\1[^>]*>#i',
			$html,
			$matches,
			PREG_OFFSET_CAPTURE
		);

		return $found ? substr( $html, 0, $matches[0][1] ) : $html;
	}
}
