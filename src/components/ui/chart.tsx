import React, { forwardRef, createContext, useContext, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

const THEMES = { light: '', dark: '' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = createContext<ChartContextProps | null>(null);

function useChart() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }
  return context;
}

const ChartContainer = forwardRef<View, {
  style?: any;
  config: ChartConfig;
  children: React.ReactNode;
}>(({ style, config, children }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <View
        ref={ref}
        style={[styles.container, style]}
      >
        {children}
      </View>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'ChartContainer';

// ChartStyle is not needed in React Native as we handle styles directly
const ChartStyle = () => null;

const ChartTooltipContent = forwardRef<View, {
  style?: any;
  active?: boolean;
  payload?: any[];
  label?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: 'line' | 'dot' | 'dashed';
  nameKey?: string;
  labelKey?: string;
  formatter?: (value: any, name: string, item: any, index: number, payload: any) => React.ReactNode;
  color?: string;
}>(
  ({
    style,
    active,
    payload,
    label,
    hideLabel = false,
    hideIndicator = false,
    indicator = 'dot',
    nameKey,
    labelKey,
    formatter,
    color,
  }, ref) => {
    const { config } = useChart();

    const tooltipLabel = useMemo(() => {
      if (hideLabel || !payload?.length) return null;

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || 'value'}`;
      const itemConfig = getPayloadConfigFromPayload(config, item, key);
      const value = !labelKey && typeof label === 'string'
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

      return value ? (
        <Text style={[styles.label, styles.labelText]}>
          {value}
        </Text>
      ) : null;
    }, [label, payload, hideLabel, config, labelKey]);

    if (!active || !payload?.length) return null;

    const nestLabel = payload.length === 1 && indicator !== 'dot';

    return (
      <View
        ref={ref}
        style={[styles.tooltip, style]}
      >
        {!nestLabel ? tooltipLabel : null}
        <View style={styles.tooltipContent}>
          {payload.map((item: any, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor = color || item.payload?.fill || item.color;

            return (
              <View
                key={item.dataKey || index}
                style={[styles.tooltipItem, indicator === 'dot' && styles.tooltipItemDot]}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <View
                          style={[
                            styles.indicator,
                            indicator === 'dot' && styles.indicatorDot,
                            indicator === 'line' && styles.indicatorLine,
                            indicator === 'dashed' && styles.indicatorDashed,
                            nestLabel && indicator === 'dashed' && styles.indicatorDashedNested,
                            { backgroundColor: indicatorColor, borderColor: indicatorColor },
                          ]}
                        />
                      )
                    )}
                    <View
                      style={[styles.itemContent, nestLabel ? styles.itemContentNested : styles.itemContentDefault]}
                    >
                      <View>
                        {nestLabel ? tooltipLabel : null}
                        <Text style={styles.itemName}>
                          {itemConfig?.label || item.name}
                        </Text>
                      </View>
                      {item.value && (
                        <Text style={styles.itemValue}>
                          {item.value.toLocaleString()}
                        </Text>
                      )}
                    </View>
                  </>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegendContent = forwardRef<View, {
  style?: any;
  hideIcon?: boolean;
  payload?: any[];
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}>(
  ({ style, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
    const { config } = useChart();

    if (!payload?.length) return null;

    return (
      <View
        ref={ref}
        style={[
          styles.legend,
          verticalAlign === 'top' ? styles.legendTop : styles.legendBottom,
          style,
        ]}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <View
              key={item.value}
              style={styles.legendItem}
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <View
                  style={[styles.legendIcon, { backgroundColor: item.color }]}
                />
              )}
              <Text style={styles.legendLabel}>{itemConfig?.label}</Text>
            </View>
          );
        })}
      </View>
    );
  }
);
ChartLegendContent.displayName = 'ChartLegendContent';

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) return undefined;

  const payloadPayload = 'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
    ? payload.payload
    : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  tooltip: {
    minWidth: 128,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontWeight: '500',
  },
  labelText: {
    fontSize: 14,
    color: '#111827',
  },
  tooltipContent: {
    gap: 6,
  },
  tooltipItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 8,
  },
  tooltipItemDot: {
    alignItems: 'center',
  },
  indicator: {
    flexShrink: 0,
    borderRadius: 2,
  },
  indicatorDot: {
    width: 10,
    height: 10,
  },
  indicatorLine: {
    width: 4,
    height: '100%',
  },
  indicatorDashed: {
    width: 0,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  indicatorDashedNested: {
    marginVertical: 2,
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemContentNested: {
    alignItems: 'flex-end',
  },
  itemContentDefault: {
    alignItems: 'center',
  },
  itemName: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  legendTop: {
    paddingBottom: 12,
  },
  legendBottom: {
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIcon: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 12,
    color: '#111827',
  },
});

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
  ChartStyle,
};