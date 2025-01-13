import { forwardRef } from 'react';
import { MantineLoaderComponent } from '@mantine/core';

const ParseableAnimated: MantineLoaderComponent = forwardRef(() => (
	<svg height="60px" width="60px" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15">
		<defs>
			<filter id="iconfilter" primitiveUnits="objectBoundingBox">
				<feFlood floodColor="#3A3A8C" />

				<feOffset>
					<animate attributeName="dy" from="1" to="0" dur="1500ms" repeatCount="indefinite" />
				</feOffset>

				<feComposite operator="in" in2="SourceGraphic" />
				<feComposite operator="over" in2="SourceGraphic" />
			</filter>
			<filter id="iconfilterRed" primitiveUnits="objectBoundingBox">
				<feFlood floodColor="#00A896" />

				<feOffset>
					<animate attributeName="dy" from="1" to="0" dur="1500ms" repeatCount="indefinite" />
				</feOffset>

				<feComposite operator="in" in2="SourceGraphic" />
				<feComposite operator="over" in2="SourceGraphic" />
			</filter>
		</defs>
		<g>
			<path
				filter="url(#iconfilter)"
				fill="rgba(58,58,140, 0.6)"
				d="M13.92,7.76l-5.93,5.93c-.26,.26-.06,.71,.31,.68,1.57-.12,3.11-.78,4.31-1.99s1.86-2.74,1.99-4.31c.03-.37-.42-.57-.68-.31Z"
			/>
			<path
				filter="url(#iconfilter)"
				fill="rgba(58,58,140, 0.6)"
				d="M13.97,4.61v-.02c-.36-.74-1.33-.92-1.91-.34l-7.58,7.58c-.58,.58-.4,1.55,.34,1.9h.02c.44,.22,.97,.12,1.32-.23l7.57-7.57c.35-.35,.45-.87,.24-1.32Z"
			/>
			<path
				filter="url(#iconfilter)"
				fill="rgba(58,58,140, 0.6)"
				d="M7.54,1.38c.26-.26,.06-.71-.31-.68-1.57,.12-3.11,.78-4.31,1.99S1.05,5.43,.93,7c-.03,.37,.42,.57,.68,.31L7.54,1.38Z"
			/>
		</g>
		<g>
			<path
				filter="url(#iconfilter)"
				fill="rgba(58,58,140, 0.6)"
				d="M2.67,8.27l-.87,.87c-.35,.35-.44,.88-.23,1.33v.02c.36,.73,1.33,.9,1.9,.33l.88-.88c.46-.46,.46-1.21,0-1.68h0c-.46-.46-1.21-.46-1.68,0Z"
			/>
			<path
				filter="url(#iconfilterRed)"
				fill="rgba(0,168,150, 0.7)"
				d="M7.09,7.2l3.96-3.96c.57-.57,.41-1.54-.33-1.89h-.02c-.45-.22-.98-.13-1.33,.22l-3.96,3.96c-.46,.46-.46,1.21,0,1.68h0c.46,.46,1.21,.46,1.68,0Z"
			/>
		</g>
	</svg>
));

ParseableAnimated.displayName = 'ParsableAnimated';

export default ParseableAnimated;
