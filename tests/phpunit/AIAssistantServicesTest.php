<?php

use NewfoldLabs\WP\Module\AIAssistant\Services\BriefCompiler;
use NewfoldLabs\WP\Module\AIAssistant\Services\BrandColorResolver;
use NewfoldLabs\WP\Module\AIAssistant\Services\KnowledgePrefill;
use NewfoldLabs\WP\Module\AIAssistant\Services\ResponseParser;
use NewfoldLabs\WP\Module\AIAssistant\Search\BM25\Scorer;
use NewfoldLabs\WP\Module\AIAssistant\Search\BM25\Tokenizer;

/**
 * AI Site Assistant service tests.
 */
class AIAssistantServicesTest extends WP_UnitTestCase {

	/**
	 * ResponseParser extracts JSON from fenced model output.
	 */
	public function test_response_parser_decodes_fenced_json() {
		$parser = new ResponseParser();
		$raw    = '```json
{"answer":"Hello","suggestions":["Next?"],"ctas":[],"sources":[],"needs_human":false}
```';

		$result = $parser->parse(
			$raw,
			array(),
			array(
				array(
					'title' => 'About',
					'url'   => 'https://example.com/about',
				),
			)
		);

		$this->assertSame( 'Hello', $result['answer'] );
		$this->assertSame( array( 'Next?' ), $result['suggestions'] );
	}

	/**
	 * ResponseParser drops CTAs not in the whitelist.
	 */
	public function test_response_parser_whitelists_ctas() {
		$parser = new ResponseParser();
		$raw    = '{"answer":"Go shop","ctas":[{"label":"Shop","url":"https://example.com/shop"},{"label":"Bad","url":"https://evil.test"}],"suggestions":[],"sources":[],"needs_human":false}';

		$result = $parser->parse(
			$raw,
			array(
				array(
					'label' => 'Shop',
					'url'   => 'https://example.com/shop',
				),
			),
			array()
		);

		$this->assertCount( 1, $result['ctas'] );
		$this->assertSame( 'https://example.com/shop', $result['ctas'][0]['url'] );
	}

	/**
	 * BriefCompiler quality tier thresholds.
	 */
	public function test_brief_compiler_quality_tiers() {
		$this->assertSame(
			'insufficient',
			BriefCompiler::evaluate_quality_tier( 'sentinel', 2, '' )
		);
		$this->assertSame(
			'minimal',
			BriefCompiler::evaluate_quality_tier( 'derived', 4, 'A site' )
		);
		$this->assertSame(
			'rich',
			BriefCompiler::evaluate_quality_tier( 'homepage', 6, 'A coffee shop' )
		);
	}

	/**
	 * KnowledgePrefill prefers saved business description over automatic sources.
	 */
	public function test_knowledge_prefill_uses_saved_business_description() {
		update_option( 'nfd_ai_assistant_business_description', 'Saved description' );
		update_option( 'nfd-ai-site-gen-refinedsitedescription', 'SiteGen description' );

		$this->assertSame( 'Saved description', KnowledgePrefill::get_business_description() );
	}

	/**
	 * KnowledgePrefill falls back to SiteGen when no saved description exists.
	 */
	public function test_knowledge_prefill_falls_back_to_sitegen_description() {
		delete_option( 'nfd_ai_assistant_business_description' );
		update_option( 'nfd-ai-site-gen-refinedsitedescription', 'SiteGen description' );

		$this->assertSame( 'SiteGen description', KnowledgePrefill::get_business_description() );
	}

	/**
	 * KnowledgePrefill builds curated facts from onboarding contact data.
	 */
	public function test_knowledge_prefill_builds_curated_facts_from_onboarding() {
		delete_option( 'nfd_ai_assistant_curated_facts' );
		update_option(
			'nfd_module_onboarding_site_info',
			array(
				'contact' => array(
					'phone' => '555-0100',
					'email' => 'hello@example.com',
				),
			)
		);

		$facts = KnowledgePrefill::get_curated_facts();

		$this->assertStringContainsString( '555-0100', $facts );
		$this->assertStringContainsString( 'hello@example.com', $facts );
	}

	/**
	 * BrandColorResolver falls back when palette colors are too light.
	 */
	public function test_brand_color_resolver_defaults_for_light_palette() {
		$this->assertSame( BrandColorResolver::DEFAULT_COLOR, BrandColorResolver::resolve() );
	}

	/**
	 * Tokenizer normalizes content and drops low-value terms.
	 */
	public function test_bm25_tokenizer_normalizes_search_terms() {
		$tokenizer = new Tokenizer();

		$this->assertSame(
			array( 'wifi', 'gluten', 'free', 'menu' ),
			$tokenizer->tokenize_query( 'Do you have WiFi and a gluten-free menu?' )
		);
	}

	/**
	 * BM25 scorer applies field weights.
	 */
	public function test_bm25_scorer_applies_field_weights() {
		$scorer = new Scorer();

		$this->assertSame(
			6.0,
			$scorer->weighted_frequency(
				array(
					'tf_title'   => 1,
					'tf_excerpt' => 1,
					'tf_content' => 1,
				)
			)
		);
		$this->assertGreaterThan( 0, $scorer->score_term( 3, 1, 10, 100, 100 ) );
	}
}
