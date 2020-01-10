Vue.component('material-gradient', {
    template: `
	<g type="material" desc="素材区渐变">
        <defs>
            <desc>图片</desc>
            <linearGradient id="svg-pic-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>


            <linearGradient id="svg-pic-1-1" gradientUnits="userSpaceOnUse" x1="17" y1="40" x2="63" y2="40">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg-pic-1-2" gradientUnits="userSpaceOnUse" x1="17" y1="51.5487" x2="40.5586" y2="51.5487">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg-pic-1-3" gradientUnits="userSpaceOnUse" x1="29.0622" y1="49.1566" x2="63" y2="49.1566">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
        </defs>

        <defs>
            <desc>矢量</desc>
            <linearGradient id="svg-svg-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#F64D95"/>
                <stop  offset="1" style="stop-color:#FA4B5F"/>
            </linearGradient>

			<linearGradient id="svg-svg-1-1" gradientUnits="userSpaceOnUse" x1="46.4913" y1="46.4738" x2="62.5087" y2="62.4913">
				<stop  offset="0" style="stop-color:#F64D95"/>
				<stop  offset="1" style="stop-color:#FA4B5F"/>
			</linearGradient>
			<linearGradient id="svg-svg-1-2" gradientUnits="userSpaceOnUse" x1="17.4913" y1="46.4738" x2="33.5087" y2="62.4913">
				<stop  offset="0" style="stop-color:#F64D95"/>
				<stop  offset="1" style="stop-color:#FA4B5F"/>
			</linearGradient>
			<linearGradient id="svg-svg-1-3" gradientUnits="userSpaceOnUse" x1="25.4585" y1="31.3756" x2="54.5415" y2="60.4585">
				<stop  offset="0" style="stop-color:#F64D95"/>
				<stop  offset="1" style="stop-color:#FA4B5F"/>
			</linearGradient>
        </defs>

        <defs>
            <desc>免扣素材</desc>
            <linearGradient id="svg-png-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
			<linearGradient id="svg-png-0-2" gradientUnits="userSpaceOnUse" x1="30" y1="47.5" x2="49" y2="47.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>

            <linearGradient id="svg-png-1_1_" gradientUnits="userSpaceOnUse" x1="17" y1="39.5" x2="62" y2="39.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_2_" gradientUnits="userSpaceOnUse" x1="17" y1="19.5" x2="22" y2="19.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_3_" gradientUnits="userSpaceOnUse" x1="27" y1="19.5" x2="32" y2="19.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_4_" gradientUnits="userSpaceOnUse" x1="37" y1="19.5" x2="42" y2="19.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_5_" gradientUnits="userSpaceOnUse" x1="47" y1="19.5" x2="52" y2="19.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_6_" gradientUnits="userSpaceOnUse" x1="22" y1="24.5" x2="27" y2="24.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_7_" gradientUnits="userSpaceOnUse" x1="32" y1="24.5" x2="37" y2="24.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_8_" gradientUnits="userSpaceOnUse" x1="42" y1="24.5" x2="47" y2="24.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_9_" gradientUnits="userSpaceOnUse" x1="52" y1="24.5" x2="57" y2="24.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_10_" gradientUnits="userSpaceOnUse" x1="22" y1="34.5" x2="27" y2="34.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_11_" gradientUnits="userSpaceOnUse" x1="32" y1="34.5" x2="37" y2="34.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_12_" gradientUnits="userSpaceOnUse" x1="42" y1="34.5" x2="47" y2="34.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_13_" gradientUnits="userSpaceOnUse" x1="52" y1="34.5" x2="57" y2="34.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_14_" gradientUnits="userSpaceOnUse" x1="57" y1="19.5" x2="62" y2="19.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_15_" gradientUnits="userSpaceOnUse" x1="17" y1="29.5" x2="22" y2="29.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_16_" gradientUnits="userSpaceOnUse" x1="27" y1="29.5" x2="32" y2="29.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_17_" gradientUnits="userSpaceOnUse" x1="37" y1="29.5" x2="42" y2="29.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_18_" gradientUnits="userSpaceOnUse" x1="47" y1="29.5" x2="52" y2="29.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_19_" gradientUnits="userSpaceOnUse" x1="57" y1="29.5" x2="62" y2="29.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_20_" gradientUnits="userSpaceOnUse" x1="17" y1="39.5" x2="22" y2="39.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_21_" gradientUnits="userSpaceOnUse" x1="27" y1="39.5" x2="32" y2="39.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_22_" gradientUnits="userSpaceOnUse" x1="37" y1="39.5" x2="42" y2="39.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_23_" gradientUnits="userSpaceOnUse" x1="47" y1="39.5" x2="52" y2="39.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_24_" gradientUnits="userSpaceOnUse" x1="22" y1="44.5" x2="27" y2="44.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_25_" gradientUnits="userSpaceOnUse" x1="32" y1="44.5" x2="37" y2="44.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_26_" gradientUnits="userSpaceOnUse" x1="42" y1="44.5" x2="47" y2="44.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_27_" gradientUnits="userSpaceOnUse" x1="52" y1="44.5" x2="57" y2="44.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_28_" gradientUnits="userSpaceOnUse" x1="22" y1="54.5" x2="27" y2="54.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_29_" gradientUnits="userSpaceOnUse" x1="32" y1="54.5" x2="37" y2="54.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_30_" gradientUnits="userSpaceOnUse" x1="42" y1="54.5" x2="47" y2="54.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_31_" gradientUnits="userSpaceOnUse" x1="52" y1="54.5" x2="57" y2="54.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_32_" gradientUnits="userSpaceOnUse" x1="57" y1="39.5" x2="62" y2="39.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_33_" gradientUnits="userSpaceOnUse" x1="17" y1="49.5" x2="22" y2="49.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_34_" gradientUnits="userSpaceOnUse" x1="27" y1="49.5" x2="32" y2="49.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_35_" gradientUnits="userSpaceOnUse" x1="37" y1="49.5" x2="42" y2="49.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_36_" gradientUnits="userSpaceOnUse" x1="47" y1="49.5" x2="52" y2="49.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_37_" gradientUnits="userSpaceOnUse" x1="57" y1="49.5" x2="62" y2="49.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_38_" gradientUnits="userSpaceOnUse" x1="17" y1="59.5" x2="22" y2="59.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_39_" gradientUnits="userSpaceOnUse" x1="27" y1="59.5" x2="32" y2="59.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_40_" gradientUnits="userSpaceOnUse" x1="37" y1="59.5" x2="42" y2="59.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_41_" gradientUnits="userSpaceOnUse" x1="47" y1="59.5" x2="52" y2="59.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_42_" gradientUnits="userSpaceOnUse" x1="57" y1="59.5" x2="62" y2="59.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
            <linearGradient id="svg-png-1_43_" gradientUnits="userSpaceOnUse" x1="20" y1="40.5" x2="59" y2="40.5">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-box-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#5198FE"/>
                <stop  offset="1" style="stop-color:#7756FB"/>
            </linearGradient>

            <linearGradient id="svg_box_1_1_" gradientUnits="userSpaceOnUse" x1="17" y1="46" x2="39" y2="46">
                <stop  offset="0" style="stop-color:#5198FE"/>
                <stop  offset="1" style="stop-color:#7756FB"/>
            </linearGradient>
            <linearGradient id="svg_box_1_2_" gradientUnits="userSpaceOnUse" x1="41" y1="46" x2="63" y2="46">
                <stop  offset="0" style="stop-color:#5198FE"/>
                <stop  offset="1" style="stop-color:#7756FB"/>
            </linearGradient>
			<linearGradient id="svg_box_1_3_" gradientUnits="userSpaceOnUse" x1="17" y1="27" x2="63" y2="27">
				<stop  offset="0" style="stop-color:#5198FE"/>
				<stop  offset="1" style="stop-color:#7756FB"/>
			</linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-banner-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#5198FE"/>
                <stop  offset="1" style="stop-color:#7756FB"/>
            </linearGradient>

            <linearGradient id="svg_banner_11_" gradientUnits="userSpaceOnUse" x1="10" y1="43" x2="30" y2="43">
                <stop  offset="0" style="stop-color:#5198FE"/>
                <stop  offset="1" style="stop-color:#7756FB"/>
            </linearGradient>
            <linearGradient id="svg_banner_12_" gradientUnits="userSpaceOnUse" x1="50" y1="43" x2="70" y2="43">
                <stop  offset="0" style="stop-color:#5198FE"/>
                <stop  offset="1" style="stop-color:#7756FB"/>
            </linearGradient>
			<linearGradient id="svg_banner_13_" gradientUnits="userSpaceOnUse" x1="20" y1="37" x2="60" y2="37">
				<stop  offset="0" style="stop-color:#5198FE"/>
				<stop  offset="1" style="stop-color:#7756FB"/>
			</linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-icon-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#F64D95"/>
                <stop  offset="1" style="stop-color:#FA4B5F"/>
            </linearGradient>

			<linearGradient id="svg_icon_1_1_" gradientUnits="userSpaceOnUse" x1="24" y1="35.6397" x2="56" y2="35.6397">
				<stop  offset="0" style="stop-color:#F64D95"/>
				<stop  offset="1" style="stop-color:#FA4B5F"/>
			</linearGradient>
			<linearGradient id="svg_icon_1_2_" gradientUnits="userSpaceOnUse" x1="36" y1="60.6408" x2="44" y2="60.6408">
				<stop  offset="0" style="stop-color:#F64D95"/>
				<stop  offset="1" style="stop-color:#FA4B5F"/>
			</linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-chart-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#FCC12D"/>
                <stop  offset="1" style="stop-color:#FB9131"/>
            </linearGradient>

            <linearGradient id="svg_chart_1_1_" gradientUnits="userSpaceOnUse" x1="17" y1="44.5" x2="63" y2="44.5">
                <stop  offset="0" style="stop-color:#FCC12D"/>
                <stop  offset="1" style="stop-color:#FB9131"/>
            </linearGradient>
            <linearGradient id="svg_chart_1_2_" gradientUnits="userSpaceOnUse" x1="17" y1="27.8398" x2="63" y2="27.8398">
                <stop  offset="0" style="stop-color:#FCC12D"/>
                <stop  offset="1" style="stop-color:#FB9131"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-line-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#FCC12D"/>
                <stop  offset="1" style="stop-color:#FB9131"/>
            </linearGradient>

            <linearGradient id="svg_line_1_1_" gradientUnits="userSpaceOnUse" x1="64.125" y1="22" x2="14.8744" y2="22">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_2_" gradientUnits="userSpaceOnUse" x1="64.125" y1="45" x2="14.8744" y2="45">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_3_" gradientUnits="userSpaceOnUse" x1="64.125" y1="45" x2="14.8744" y2="45">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_4_" gradientUnits="userSpaceOnUse" x1="64.125" y1="45" x2="14.8744" y2="45">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_5_" gradientUnits="userSpaceOnUse" x1="64.125" y1="45" x2="14.8744" y2="45">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_6_" gradientUnits="userSpaceOnUse" x1="64.125" y1="45" x2="14.8744" y2="45">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_7_" gradientUnits="userSpaceOnUse" x1="64.125" y1="55.4598" x2="14.8744" y2="55.4598">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
            <linearGradient id="svg_line_1_8_" gradientUnits="userSpaceOnUse" x1="64.125" y1="34.1716" x2="14.8744" y2="34.1716">
                <stop  offset="0" style="stop-color:#08123F"/>
                <stop  offset="1" style="stop-color:#5F6583"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-shape-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#05CDFE"/>
                <stop  offset="1" style="stop-color:#1B98FE"/>
            </linearGradient>

			<linearGradient id="svg_shape_1_1_" gradientUnits="userSpaceOnUse" x1="15" y1="30" x2="45" y2="30">
				<stop  offset="0" style="stop-color:#05CDFE"/>
				<stop  offset="1" style="stop-color:#1B98FE"/>
			</linearGradient>
			<linearGradient id="svg_shape_1_2_" gradientUnits="userSpaceOnUse" x1="31" y1="48" x2="65" y2="48">
				<stop  offset="0" style="stop-color:#05CDFE"/>
				<stop  offset="1" style="stop-color:#1B98FE"/>
			</linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg-decoration-0-1" gradientUnits="userSpaceOnUse" x1="1.175" y1="1.175" x2="78.825" y2="78.825">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>

			<linearGradient id="svg_decoration_1_1_" gradientUnits="userSpaceOnUse" x1="16.4586" y1="40" x2="63.5414" y2="40">
				<stop  offset="0" style="stop-color:#ACDE51"/>
				<stop  offset="1" style="stop-color:#5CD673"/>
			</linearGradient>
            <linearGradient id="svg_decoration_1_2_" gradientUnits="userSpaceOnUse" x1="26.1157" y1="27.3022" x2="54" y2="27.3022">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_3_" gradientUnits="userSpaceOnUse" x1="25" y1="37.5" x2="28" y2="37.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_4_" gradientUnits="userSpaceOnUse" x1="21" y1="41.5" x2="24" y2="41.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_5_" gradientUnits="userSpaceOnUse" x1="26" y1="44.5" x2="29" y2="44.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_6_" gradientUnits="userSpaceOnUse" x1="25" y1="50.5" x2="28" y2="50.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_7_" gradientUnits="userSpaceOnUse" x1="32" y1="52.5" x2="35" y2="52.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_8_" gradientUnits="userSpaceOnUse" x1="38" y1="57.5" x2="41" y2="57.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_9_" gradientUnits="userSpaceOnUse" x1="43" y1="52.5" x2="46" y2="52.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_10_" gradientUnits="userSpaceOnUse" x1="51" y1="53.5" x2="54" y2="53.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_11_" gradientUnits="userSpaceOnUse" x1="49" y1="47.5" x2="52" y2="47.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_12_" gradientUnits="userSpaceOnUse" x1="55" y1="43.5" x2="58" y2="43.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
            <linearGradient id="svg_decoration_1_13_" gradientUnits="userSpaceOnUse" x1="53" y1="37.5" x2="56" y2="37.5">
                <stop  offset="0" style="stop-color:#ACDE51"/>
                <stop  offset="1" style="stop-color:#5CD673"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="svg_qrCode_1-1" x1="18" y1="28" x2="38" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#5198fe"/><stop offset="1" stop-color="#7756fb"/>
            </linearGradient>
            <linearGradient id="svg_qrCode_1-2" y1="53" y2="53" xlink:href="#svg_qrCode_1-1"/>
            <linearGradient id="svg_qrCode_1-3" x1="43" x2="63" xlink:href="#svg_qrCode_1-1"/>
            <linearGradient id="svg_qrCode_1-4" x1="43" y1="45.5" x2="48" y2="45.5" xlink:href="#svg_qrCode_1-1"/>
            <linearGradient id="svg_qrCode_1-5" x1="58" y1="45.5" x2="63" y2="45.5" xlink:href="#svg_qrCode_1-1"/>
            <linearGradient id="svg_qrCode_1-6" x1="48" y1="53" x2="53" y2="53" xlink:href="#svg_qrCode_1-1"/>
            <linearGradient id="svg_qrCode_1-7" x1="53" y1="58" x2="63" y2="58" xlink:href="#svg_qrCode_1-1"/>
            <linearGradient id="svg_qrCode_1-8" x1="43" y1="60.5" x2="48" y2="60.5" xlink:href="#svg_qrCode_1-1"/>
        </defs>

        <defs>
            <filter id="svg_map" x="0" y="0" width="83" height="83" filterUnits="userSpaceOnUse">
                <feOffset dy="1" input="SourceAlpha"/>
                <feGaussianBlur stdDeviation="0.5" result="blur"/>
                <feFlood flood-opacity="0.102"/>
                <feComposite operator="in" in2="blur"/>
                <feComposite in="SourceGraphic"/>
            </filter>
            <linearGradient id="svg-map-gradient" x1="0.012" y1="0.392" x2="0.956" y2="0.395" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#07c8fe"/>
                <stop offset="1" stop-color="#179ffe"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="未命名的渐变_27" x1="15.5" y1="40.63" x2="62.95" y2="40.63" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#acde51"/>
                <stop offset="1" stop-color="#5cd673"/>
            </linearGradient>
            <linearGradient id="未命名的渐变_27-2" x1="85.15" y1="73.43" x2="108.83" y2="73.43" gradientTransform="translate(126.83 -70.83) rotate(90)" xlink:href="#未命名的渐变_27"/>
        </defs>

        <defs>
            <linearGradient id="svg-gradient-table_1" x1="12" y1="39.56" x2="68" y2="39.56" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#05cdfe"/>
                <stop offset="1" stop-color="#1b98fe"/>
            </linearGradient><linearGradient id="svg-gradient-table_2" x1="20.94" y1="28.81" x2="32.94" y2="28.81" xlink:href="#svg-gradient-table_1"/>
            <linearGradient id="svg-gradient-table_3" x1="36.42" y1="28.81" x2="59.46" y2="28.81" xlink:href="#svg-gradient-table_1"/>
            <linearGradient id="svg-gradient-table_4" x1="20.94" y1="39.02" x2="32.94" y2="39.02" xlink:href="#svg-gradient-table_1"/>
            <linearGradient id="svg-gradient-table_5" x1="36.42" y1="39.02" x2="59.46" y2="39.02" xlink:href="#svg-gradient-table_1"/>
            <linearGradient id="svg-gradient-table_6" x1="20.94" y1="49.23" x2="32.94" y2="49.23" xlink:href="#svg-gradient-table_1"/>
            <linearGradient id="svg-gradient-table_7" x1="36.42" y1="49.23" x2="59.46" y2="49.23" xlink:href="#svg-gradient-table_1"/>
        </defs>

        <defs>
	        <linearGradient id="未命名的渐变_64" x1="20" y1="40" x2="60" y2="40" gradientUnits="userSpaceOnUse">
	        <stop offset="0" stop-color="#fcc12d"/>
	        <stop offset="1" stop-color="#fb9131"/>
	        </linearGradient>
        </defs>

        <defs>
            <linearGradient id="pie_chart_1" x1="25.3" y1="54.78" x2="63.33" y2="16.75" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/><stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="pie_chart_2" x1="43.93" y1="36.78" x2="63.64" y2="15.71" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/><stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="donut_chart_1" x1="24.66" y1="55.42" x2="69.27" y2="10.81" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/><stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="donut_chart_2" x1="45.25" y1="35.39" x2="64.6" y2="16.04" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/>
                <stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="rose_chart_1" x1="34.55" y1="41.09" x2="19.66" y2="49.84" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/><stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="rose_chart_2" x1="39.84" y1="46.36" x2="34.96" y2="58.44" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/>
                <stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="rose_chart_2-2" x1="48.03" y1="42.13" x2="70.52" y2="50.59" xlink:href="#rose_chart_2"/>
            <linearGradient id="rose_chart_1-2" x1="47.09" y1="51.19" x2="53.67" y2="65.28" xlink:href="#rose_chart_1"/>
            <linearGradient id="rose_chart_2-3" x1="34.59" y1="35.07" x2="15.12" y2="28.53" xlink:href="#rose_chart_2"/>
            <linearGradient id="rose_chart_1-3" x1="40.13" y1="30.78" x2="31.84" y2="15.57" xlink:href="#rose_chart_1"/>
            <linearGradient id="rose_chart_1-4" x1="48.27" y1="36.49" x2="61.53" y2="32.04" xlink:href="#rose_chart_1"/>
            <linearGradient id="rose_chart_2-4" x1="46.27" y1="29.24" x2="52.02" y2="17.49" xlink:href="#rose_chart_2"/>
        </defs>

        <defs>
            <linearGradient id="line_chart_1" x1="25.91" y1="36.11" x2="58.11" y2="36.11" gradientTransform="translate(-0.23 0.29) rotate(-0.4)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/>
                <stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="line_chart_2" x1="19.25" y1="40.21" x2="59.5" y2="40.21" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/>
                <stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="gline_chart_1" x1="27.57" y1="31.92" x2="57.56" y2="31.92" gradientTransform="translate(-0.23 -0.42) rotate(-0.4)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/><stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="gline_chart_1-2" x1="28.91" y1="44.7" x2="56.24" y2="44.7" xlink:href="#gline_chart_1"/>
            <linearGradient id="gline_chart_2" x1="19.25" y1="40.21" x2="59.5" y2="40.21" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/>
                <stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
        </defs>

        <defs>
            <linearGradient id="rect_chart_1" x1="25" y1="55.65" x2="25" y2="35.45" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/><stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="rect_chart_1-2" x1="45" y1="54.55" x2="45" y2="17.82" xlink:href="#rect_chart_1"/>
            <linearGradient id="rect_chart_2" x1="55" y1="59.72" x2="55" y2="27.59" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/>
                <stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="rect_chart_2-2" x1="35" y1="59.77" x2="35" y2="31.53" xlink:href="#rect_chart_2"/>
        </defs>

        <defs>
            <linearGradient id="grect_chart_1" x1="23.5" y1="53.54" x2="23.5" y2="28.75" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/><stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="grect_chart_1-2" x1="37.5" y1="52.26" x2="37.5" y2="15.53" xlink:href="#grect_chart_1"/>
            <linearGradient id="grect_chart_2" x1="42.5" y1="55.64" x2="42.5" y2="23.52" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/>
                <stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="grect_chart_2-2" x1="28.5" y1="55.33" x2="28.5" y2="32.94" xlink:href="#grect_chart_2"/>
            <linearGradient id="grect_chart_1-3" x1="51.5" y1="55.1" x2="51.5" y2="33.07" xlink:href="#grect_chart_1"/>
            <linearGradient id="grect_chart_2-3" x1="56.5" y1="56.61" x2="56.5" y2="39.08" xlink:href="#grect_chart_2"/>
        </defs>

        <defs>
            <linearGradient id="hrect_chart_1" x1="25" y1="59.64" x2="25" y2="36.68" gradientTransform="translate(7.5 -22.5)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/>
                <stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="hrect_chart_1-2" x1="45" y1="59.36" x2="45" y2="21.71" gradientTransform="translate(-4.5 5.5)" xlink:href="#hrect_chart_1"/>
            <linearGradient id="hrect_chart_2" x1="55" y1="59.68" x2="55" y2="23.66" gradientTransform="translate(-16.5 13.5)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/>
                <stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="hrect_chart_2-2" x1="35" y1="59.74" x2="35" y2="29.56" gradientTransform="translate(0.5 -9.5)" xlink:href="#hrect_chart_2"/>
        </defs>

        <defs>
            <linearGradient id="hGRect_chart_1" x1="23.5" y1="57.28" x2="23.5" y2="32.49" gradientTransform="translate(10 -25)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#999"/>
                <stop offset="0.56" stop-color="#616161"/>
                <stop offset="1" stop-color="#333"/>
            </linearGradient>
            <linearGradient id="hGRect_chart_1-2" x1="38.5" y1="55.57" x2="38.5" y2="18.84" gradientTransform="translate(1.5 -3.5)" xlink:href="#hGRect_chart_1"/>
            <linearGradient id="hGRect_chart_2" x1="43.5" y1="56.51" x2="43.5" y2="23.41" gradientTransform="translate(-6.5 -1.5)" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#ffd1b9"/><stop offset="0.44" stop-color="#ffab81"/>
                <stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="hGRect_chart_2-2" x1="28.5" y1="56.82" x2="28.5" y2="34.43" gradientTransform="translate(3 -22)" xlink:href="#hGRect_chart_2"/>
            <linearGradient id="hGRect_chart_1-3" x1="53.5" y1="57.04" x2="53.5" y2="28.58" gradientTransform="translate(-18 7)" xlink:href="#hGRect_chart_1"/>
            <linearGradient id="hGRect_chart_2-3" x1="58.5" y1="56.68" x2="58.5" y2="31.36" gradientTransform="translate(-25.5 9.5)" xlink:href="#hGRect_chart_2"/>
        </defs>

        <defs>
            <linearGradient id="svg-mall-gradient" y1="0.5" x2="1.017" y2="0.5" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#ff991f"/>
                <stop offset="0.505" stop-color="#fe7747"/>
                <stop offset="1" stop-color="#ff4d62"/>
            </linearGradient>

            <linearGradient id="svg-program-gradient" x1="0.259" y1="0.155" x2="0.775" y2="0.829" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#4cddba"/>
                <stop offset="1" stop-color="#27b6d3"/>
            </linearGradient>

            <linearGradient id="svg-site-gradient1" x1="0.975" y1="0.9" x2="0.184" y2="0.221" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#55b9f9"/>
                <stop offset="0.931" stop-color="#3a8ffc"/>
            </linearGradient>
            <linearGradient id="svg-site-gradient2" x1="0.287" y1="0.927" x2="0.71" y2="0.048" xlink:href="#svg-site-gradient1"/>
        </defs>
        <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="wordartsvggradient1" x1="9.17" x2="60.43" y1="39.64" y2="39.64">
                <stop offset="0" stop-color="#5198fe" />
                <stop offset="1" stop-color="#7756fb" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="wordartsvggradient2" x1="40.97" x2="71.96" y1="47.97" y2="47.97">
                <stop offset="0" stop-color="#cae0ff">
                </stop>
                <stop offset="1" stop-color="#d6ccfe">
                </stop>
            </linearGradient>

        <linearGradient id="svg-folder-gradient2" y1="0.5" x2="1" y2="0.5" gradientUnits="objectBoundingBox">
            <stop offset="0" stop-color="#fcc12d"/>
            <stop offset="1" stop-color="#fb9131"/>
        </linearGradient>
        </defs>

        <defs>
            <linearGradient id="qrcodeUploadLineGradient1" x1="-5.15" y1="24.5" x2="19.85" y2="24.5" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#f73" stop-opacity="0"/><stop offset="1" stop-color="#f73"/>
            </linearGradient>
            <linearGradient id="qrcodeUploadLineGradient2" x1="52.85" y1="24.5" x2="27.85" y2="24.5" gradientTransform="matrix(1, 0, 0, -1, 0, 49)" xlink:href="#qrcodeUploadLineGradient1"/>
        </defs>

        <defs>
            <desc>内部素材</desc>
            <linearGradient id="linear-gradient" x1="0.914" y1="0.909" x2="0.149" y2="0.119" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#c3efc4"/>
                <stop offset="1" stop-color="#dcf1ba"/>
            </linearGradient>
            <linearGradient id="linear-gradient-2" x1="0.824" y1="0.909" x2="0.104" y2="0.141" gradientUnits="objectBoundingBox">
                <stop offset="0" stop-color="#62d770"/>
                <stop offset="1" stop-color="#a2dd55"/>
            </linearGradient>
        </defs>
	</g>`,
    data() {
        return {

        };
    },
    computed: {

    },
});
