<template>
  <div class="bg-[var(--color-surface)] text-[var(--color-text-on-surface)]">
    <component
      v-for="(item, index) in render"
      :key="`comprehensive-${index}`"
      :is="cm[item?.component]"
      v-bind="item?.config"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue';

import type { Response } from './types/type';
import Text from '@/components/Text.vue';
import { Location, SearchResultType, Title } from './components/index';
import {useStore} from '@/utils/store'
import { PropertyTpeMapping } from './types/type';

import './style/index.css'
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

provide('openLink', (url: string, brand?: string) => {
  window.topTunnel.emit({
    type: 'intent',
    payload: {
      intent: "open-url",
      params: {
        url: url,
        brand: brand || 'expedia',
        title: t('dialog.title'),
        subTitle: t('dialog.content'),
        confirmBtn: t('dialog.continue'),
        cancelBtn: t('dialog.cancel')
      }
    }
  })
})

provide('formatDate', formatDate)

const Store = useStore()
const render = ref<Array<{
  component: string,
  config: object
}>>([])
const cm: Record<string, unknown> = {
  SearchResultType,
  Text, Location, Title
}

// 定义一个函数来格式化日期
function formatDate(dateString?: string) {
  if (!dateString) {
    return ''
  }

  // 创建一个日期对象
  const date = new Date(dateString.replace(/([+-]\d{2}:\d{2})$/, ''));

  // 定义月份的缩写
  const monthNames = [
    t('Jan'),
    t('Feb'),
    t('Mar'),
    t('Apr'),
    t('May'),
    t('Jun'),
    t('Jul'),
    t('Aug'),
    t('Sep'),
    t('Oct'),
    t('Nov'),
    t('Dec'),
  ];

  // 获取月份和日期
  const month = monthNames[date.getMonth()]; // getMonth() 返回 0-11，对应 1-12 月
  const day = String(date.getDate()).padStart(2, '0'); // getDate() 返回 1-31，padStart 用于补零

  // 返回格式化的日期
  return `${month} ${day}`;
}

function formatHour(isoString?: string) {
  if (!isoString) {
    return
  }

  // 创建一个日期对象
  const date = new Date(isoString.replace(/([+-]\d{2}:\d{2})$/, ''));

  // 获取小时和分钟
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // 确定是上午还是下午
  const amPm = hours >= 12 ? 'pm' : 'am';

  // 将 24 小时制转换为 12 小时制
  hours = hours % 12 || 12; // 如果是 0，则转换为 12

  // 格式化小时
  const formattedHours = String(hours).padStart(2, '0');

  // 返回格式化的时间
  return `${formattedHours}:${minutes}${amPm}`;
}

function calculateTimeDifference(startISO?: string, endISO?: string) {
  if (!startISO || !endISO) {
    return {
      days: 0,
      formattedDiff: ''
    };
  }

  // 创建日期对象
  const start = new Date(startISO.replace(/([+-]\d{2}:\d{2})$/, ''));
  const end = new Date(endISO.replace(/([+-]\d{2}:\d{2})$/, ''));

  // 计算时间差（以毫秒为单位）
  const diff = end.getTime() - start.getTime();

  // 计算相差的整数天数
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  // 计算剩余的小时数
  const remainingHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  // 计算剩余的分钟数
  const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // 格式化结果
  const formattedDiff = `${remainingHours}h ${remainingMinutes}m`;

  // 返回结果
  return {
    days: days,
    formattedDiff: formattedDiff
  };
}

function sendHeight() {
  const height = Math.min(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight
  );
  window.topTunnel.emit({
      type: 'ui-size-change',
      payload: {
        height: height + 30
      }
    })
}

function generateRenderConfig(data: Response) {
  const config: Array<Record<string, unknown>> = []
  const d = data

  d?.cards?.title && config.push({
    component: 'Title',
    config: {
      star: true,
      content: d.cards.title
    }
  })
  d?.cards?.responseIntroduction && config.push({
    component: 'Text',
    config: {
      response: d.cards.responseIntroduction
    }
  })

  d?.cards?.destinations && config.push({
    component: 'Location',
    config: {
      globalLevel: true,
      locations: (d.cards.destinations.data || [])?.map(l => ({
        src: l.imageUrl,
        name: l.country,
        region: l.continent,
        des: l.introduction,
      }))
    }
  })

  const toSort: { component: unknown, timestamp: Date, config: object }[] = []
  const multiResult = d.cards?.hotels?.length && d.cards?.flights?.length

  d.cards?.flights && d.cards?.flights.map((flight) => {
    const { required_slots, optional_slots } = flight.slots || {}
    const isRoundTrip = !!optional_slots?.destination2
    const segmentMap: Record<string|number, unknown> = {}

    flight.Segments?.forEach((item,index) => {
      segmentMap[item.SegmentId || index] = item
    })

    const config1 = {
      component: 'SearchResultType',
      timestamp: new Date(required_slots?.departureDate || ''),
      config: {
        component: isRoundTrip ? 'RoundFlight' : 'Flight',
        title: multiResult && flight.categoryLabel,
        data: (flight.Offers || [])?.filter(item => item.SegmentIds?.length)
          .map(of => {
            const sgs = of.SegmentIds?.map(id => segmentMap[id])
              .filter(i => !!i)
              .map(f => {
                const departure = f.Legs[0] || {}
                const arrival = f.Legs[f.TotalStops || 0] || {}
                const equips: Array<string> = []

                of.FareOptions?.forEach(item => {
                  if (item.Amenities?.SeatChoice?.Availability === 'INCLUDED') {
                    equips.push(t('flight.equip.seat'))
                  }
                })

                if (of?.Refundable) {
                  equips.push(t('flight.equip.refund'))
                }

                const { days, formattedDiff} = calculateTimeDifference(departure.DepartureDateTime, arrival.ArrivalDateTime)

                return {
                  origin: {
                    departure: {
                      city: departure.DepartureAirport?.City,
                      name: departure.DepartureAirport?.Name,
                      time: departure.DepartureDateTime
                    },
                    arrival: {
                      city: departure.ArrivalAirport?.City,
                      name: departure.ArrivalAirport?.Name,
                      time: departure.ArrivalDateTime
                    },
                  },
                  icon: 'airlines_placeholder',
                  startTime: formatHour(departure.DepartureDateTime),
                  endTime: formatHour(arrival.ArrivalDateTime),
                  startLocation: departure?.DepartureAirport?.Code,
                  endLocation: arrival?.ArrivalAirport?.Code,
                  totalTime: formattedDiff,
                  stop: f.TotalStops,
                  type: of.FareOptions?.length ? of.FareOptions[0].FareName : departure.CabinClass,
                  totalPrice: of?.OfferPrice?.TotalPrice?.Value,
                  unit: of?.OfferPrice?.TotalPrice?.Currency,
                  equips: equips.length ? equips : [t('flight.equip.default')],
                  // Object.keys(f.Legs[0]?.Amenities || {}),
                  // equips: equips.length ? equips : [of.FareOptions && of.FareOptions[0]?.FareName || ''],
                  overDays: days,
                  url: of.Links?.WebDetails?.Href,
                  airlineDes: `${t('marketing.airline', {
                    airline: departure.MarketingAirlineName
                  })}, ${t('operatedBy', { operator: departure.OperatingAirlineName })}`
                }
              })

            return isRoundTrip ? sgs : (sgs?.length ? sgs[0] : {})
          })
      }
    }

    toSort.push(config1)
  })

  d.cards?.hotels && d.cards?.hotels.map(hotel => {
    let person = ''
    let range = ''

    if (hotel.StayDates?.CheckInDate) {
      range += formatDate(hotel.StayDates?.CheckInDate)
    }
    if (hotel.StayDates?.CheckOutDate) {
      range += ` - ${formatDate(hotel.StayDates?.CheckOutDate)}`
    }

    hotel.Occupants?.forEach(o => {
      if (o.Adults) {
        person = `${o.Adults} ${t('person.unit')}`
      }
    })

    const allHotel = hotel?.Hotels?.map(h => {
      return {
        type: h.PropertyType,
        detailType: PropertyTpeMapping[h.DetailedPropertyType] || h.DetailedPropertyType || h.PropertyType,
        images: [h.ThumbnailUrl],
        name: h.Name,
        neighborhoodName: h.Location?.Neighborhood?.Name,
        rate: h.GuestRating,
        totalPrice: h.RoomTypes && h.RoomTypes[0] && h.RoomTypes[0].Price?.TotalPriceWithHotelFees?.Value,
        requirement: `${person} • ${range}`,
        unit: h.LocalCurrencyCode,
        priceDes: t('price.des'),
        url: !!h.RoomTypes?.length ? (h.RoomTypes[0].Links?.WebDetails?.Href) : h?.Links?.WebSearchResult?.Href,
        room: h.RoomTypes?.map(room => {
          const data = room.Description?.split(/-|,/)
          const rate = room.RatePlans?.[0]
          const replaceStr = []

          if (rate) {
            rate.FreeBreakfast && (replaceStr.push(t('hotel.equip.wifi')))
            rate.FreeWiFi && (replaceStr.push(t('hotel.equip.breakfast')))
            rate.CancellationPolicy?.Refundable && (replaceStr.push(t('hotel.equip.refund')))
          }

          if (data && data.length) {
            const [name, ...des] = data
            return {
              name,
              description: (des || replaceStr).join(' • ') || h.Description?.RoomTeaser
            }
          } else {
            return {
              name: 'Room',
              description: replaceStr.join(' • ') || h.Description?.RoomTeaser
            }
          }
        })
      }
    })

    const rental = allHotel?.filter(item => item.type === 'Vacation Rental')
    const normalHotel = allHotel?.filter(item => item.type !== 'Vacation Rental')

    if (rental?.length) {
      toSort.push({
        component: 'SearchResultType',
        timestamp: new Date(hotel.StayDates?.CheckInDate || ''),
        config: {
          component: 'Rental',
          title: multiResult && hotel.categoryLabel,
          data: rental,
          brand: {
            icon: 'vrbo-brand',
            title: t('vrbo')
          }
        }
      })
    }

    if (normalHotel?.length) {
      toSort.push({
        component: 'SearchResultType',
        timestamp: new Date(hotel.StayDates?.CheckInDate || ''),
        config: {
          component: normalHotel?.length === 1 ? 'Room' : 'Hotel',
          title: multiResult && hotel.categoryLabel,
          data: normalHotel
        }
      })
    }
  })

  config.push(...toSort.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()))

  render.value = config
}

const observer = new MutationObserver(sendHeight);
let off:null | (() => void) = null;

async function mountedHandle() {
  off = window.topTunnel.on((data) => {
    console.log('window refresh data:', data)

    data.language && (locale.value = data.language)
    data.theme && (Store.setTheme(data.theme))
  })

  const data = await window.topTunnel.next()

  if (data) {
    data.language && (locale.value = data.language)
    data.theme && (Store.setTheme(data.theme))

    if (data.cards) {
      generateRenderConfig(data)
    } else if (data.url) {
      window.topTunnel.emit({
        type: 'intent',
        payload: {
          intent: "open-url",
          params: {
            url: data.url,
            brand: data.brand || 'expedia'
          }
        }
      })
    }
  }

  observer.observe(document.body, { childList: true, subtree: true });
}

onMounted(() => {
  mountedHandle()
})

onUnmounted(() => {
  off && off()
  observer.disconnect()
})
</script>
