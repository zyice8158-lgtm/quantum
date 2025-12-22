import { Language } from "@/utils/i18n"

export const SceneType = {
  SingleAccommondation: 0,
  MultiAccommondation: 1,
  RoundTrip: 2,
  Itinerary: 3, // 机酒混合
  SearchLocation: 4,
}

export type Location = {
  src?: string,
  name?: string,
  source?: string,
  region?: string,
  des?: string,
}

export type Flight = {
  origin: {
    departure: {
      city?: string,
      name?: string,
      time?: string
    },
    arrival: {
      city?: string,
      name?: string,
      time?: string
    },
  },
  icon: string
  startTime: string
  endTime: string
  startLocation: string
  endLocation: string
  totalTime: string
  stop: number
  type: string
  totalPrice: number
  unit: string
  equips: string[]
  isRound?: boolean
  airlineDes?: string
  overDays: number
  url: string
}

export type Neighborhood = {
  images: Array<string>
  name: string
  country: string
  month: string
  price: number
  feature: Array<string>
  description: string
}

export type Hotel = {
  type: string
  detailType: string
  images: Array<string>
  name: string
  neighborhoodName: string
  rate: number
  totalPrice: number
  requirement: string // 2 adults • Nov 23 - Nov 30
  unit: string
  priceDes: string
  [key: string]: unknown
  room: Array<Room>
  url: string
}

export type Room = {
  images: Array<string>
  name: string
  hotelName: string
  rate: number
  totalPrice: number
  description: string // 2 adults • Nov 23 - Nov 30
  unit: string
  priceDes: string
  [key: string]: unknown
}

export type Theme = 'light' | 'dark'

export type DetailedPropertyType =
'Unknown' |
'Hotel' |
'Motel' |
'Hotel Resort' |
'Inn' |
'Bed & Breakfast' |
'Guest House' |
'Condo' |
'All-Inclusive' |
'Cabin' |
'Chalet' |
'Cottage' |
'Hostel / Backpacker Accommodation' |
'Ranch' |
'Villa' |
'Lodge' |
'Apartment' |
'Private Vacation Home' |
'House Boat' |
'Ryokan' |
'Tree House' |
'Apart-hotel' |
'Condominium Resort' |
'Caravan Park' |
'Riad' |
'Hostel (Budget Hotel)' |
'Country House' |
'Pension' |
'Pousada (Portugal)' |
'Pousada (Brazil)' |
'Residence' |
'TownHouse' |
'Castle' |
'Safari / Tentalow' |
'Palace' |
'Agritourism' |
'Cruise' |
'Holiday Park' |
'Capsule Hotel' |
'Mobile home'

export const PropertyTpeMapping: Record<string, string> = {
  'Apart-hotel': 'Aparthotel',
  'Apartment': 'Apartment',
  'Private Vacation Home': 'Private vacation home',
  'Residence': 'Residence',
  'Condominium Resort': 'Condo resort',
  'Villa': 'Villa',
  'Condo': 'Condo',
  'Chalet': 'Chalet',
  'Cottage': 'Cottage',
  'House Boat': 'Houseboat',
  'Cabin': 'Cabin',
  'Camping': 'Camping',
}

export type Response = {
  language?: Language
  theme?: Theme
  cards: {
    name: string
    icon: string
    title?: string
    responseIntroduction?: string
    destinations: {
      type: string,
      data: Array<{
        imageUrl: string
        country: string
        continent: string
        introduction: string
      }>
    }
    hotels: Array<{
      Count?: number
      TotalHotelCount?: number
      TransactionId?: string
      StayDates?: {
        CheckInDate?: string
        CheckOutDate?: string
      }
      LengthOfStay?: number
      NumberOfRooms?: number
      Occupants?: Array<{
        Adults?: string
      }>
      Hotels?: Array<{
        Id?: string
        Name?: string
        // PropertyType?: {
        //   Id?: number
        //   Name?: string
        // }
        PropertyType?: 'Conventional Lodging' | 'Vacation Rental'
        DetailedPropertyType?: DetailedPropertyType
        LocalCurrencyCode?: string
        Location?: {
          Address?: {
            Address1?: string
            City?: string
            Province?: string
            Country?: string
            PostalCode?: string
          }
          GeoLocation?: {
            Latitude?: string
            Longitude?: string
            Obfuscated?: boolean
          }
          Neighborhood?: {
            Id?: string
            Name?: string
          }
        }
        Distance?: {
          Value?: string
          Unit?: string
          Direction?: string
        }
        Description?: {
          LocationTeaser?: string
          HotelTeaser?: string
          RoomTeaser?: string
        }
        Status?: string
        ThumbnailUrl?: string
        StarRating?: string
        GuestRating?: string
        GuestReviewCount?: number
        PetFriendly?: boolean
        LgbtqiaFriendly?: boolean
        Links?: {
          WebSearchResult?: {
            Method?: string
            Href?: string
          }
        }
        RoomTypes?: Array<{
          Description?: string
          RoomKey?: string
          offerId?: string
          RatePlanType?: string
          RatePlans?: Array<{
            RoomTypeId?: string
            RatePlanId?: string
            RateRuleId?: string
            InventorySourceId?: string
            InventorySourceCode?: string
            StayDates?: {
              CheckInDate?: string
              CheckOutDate?: string
            }
            RemainingCount?: number
            Price?: {
              BaseRate?: {
                Value?: string
                Currency?: string
              }
              TaxesAndFees?: {
                Value?: string
                Currency?: string
              }
              TotalPrice?: {
                Value?: string
                Currency?: string
              }
              AvgNightlyRate?: {
                Value?: string
                Currency?: string
              }
              NightlyRates?: Array<{
                StayDate?: string
                BaseRate?: {
                  Value?: string
                  Currency?: string
                }
              }>
            }
            PaymentMethod?: string
            FreeInternet?: boolean
            FreeWiFi?: boolean
            FreeParking?: boolean
            FreeBreakfast?: boolean
            CancellationPolicy?: {
              Refundable?: boolean
              FreeCancellation?: boolean
              FreeCancellationEndDateTime?: string
              CancellationPenaltyRules?: Array<{
                PenaltyNightCount: number
                PenaltyStartDateTime: string
                PenaltyEndDateTime: string
              }>
              CancelPolicyDescription?: string
            }
          }>
          Price?: {
            BaseRate?: {
              Value?: string
              Currency?: string
            }
            TaxesAndFees?: {
              Value?: string
              Currency?: string
            }
            TotalPrice?: {
              Value?: string
              Currency?: string
            }
            AvgNightlyRate?: {
              Value?: string
              Currency?: string
            }
            AvgNightlyRateWithFees?: {
              Value?: string
              Currency?: string
            }
            TotalPriceWithHotelFees?: {
              Value?: string
              Currency?: string
            }
          }
          Links?: {
            WebDetails?: {
              Method: string
              Href: string
            }
          }
        }>
      }>
      slots: {
        required_slots?: {
          locationKeyword?: string
          checkIn?: string
          checkOut?: string
        }
        optional_slots: {}
      }
      categoryLabel: string
    }>
    flights: Array<{
      SearchCities?: Array<{
        Code: string
        City: string
        Province: string
        Country: string
      }>
      TransactionId?: string
      Offers?: [{
        OfferId?: string
        SplitTicked?: boolean
        OpaqueFlight?: boolean
        Free24HourCancellation?: boolean
        Links?: {
          WebDetails?: {
            Method: string
            Href: string
          }
        }
        SegmentIds?: Array<String>
        OfferPrice?: {
          TotalPrice?: {
            Value: string
            Currency: string
          }
          PricePerPassengerCategory?: Array<{
            Category?: string
            Count?: string
            TotalPrice?: {
              Value?: string
              Currency?: string
            }
          }>
        }
        VfopKey?: string
        Refundable?: boolean
        RefundPenalty?: Array<{
          SegmentIds?: Array<string>
          PreTripChange?: {
            Allow?: string
            Restriction?: string
            Penalty?: {
              Value?: string
              Currency?: string
            }
          }
          PreTripCancel?: {
            Allow?: string
            Restriction?: string
          }
        }>
        International?:boolean
        TicketType?: string
        FareOptions?: Array<{
          FareName?: string
          SegmentIds?: Array<string>
          Amenities?: {
            SeatChoice?: {
              Availability?: string
            }
          }
        }>
      }]
      Segments?: Array<{
        SegmentId?: string
        FlightDuration?: string
        TotalStops?: number
        DepartureArrivalDayDifference?: number
        AirportChange?: boolean
        SeatsLeft?: Number
        FareType?: string
        Legs?: Array<{
          DepartureAirport?: {
            Code?: string
            Name?: string
            City?: string
            Province?: string
            Country?: string
            Latitude?: string
            Longitude?: string
          }
          ArrivalAirport?: {
            Code?: string
            Name?: string
            City?: string
            Province?: string
            Country?: string
            Latitude?: string
            Longitude?: string
          }

          DepartureDateTime?: string
          ArrivalDateTime?: string
          FlightNumber?: string
          MarketingAirlineCode?: string
          MarketingAirlineName?: string
          OperatingAirlineCode?: string
          OperatingAirlineName?: string
          EquipmentCode?: string
          EquipmentName?: string
          FlightDuration?: string
          ConnectionTime?: string
          SeatMapAvailable?: boolean
          FlightDistance?: {
            Value: string
            Unit: string
          }
          BookingCode?: string
          CabinClass?: string
          FareBasisCode?: string
          EquipmentChange?: boolean
          MealOptions: Array<string> // REFRESHMENT_INCLUDED, FOOD_FOR_PURCHASE
          Amenities?: {
            Wifi?: {
              Available?: string //NO, YES
            }
            Entertainment?: {
              Available?: string
              Types: Array<string> //ON_DEMAND, STREAMING
            }
            Power?: {
              Available?: string
            }
          }
        }>
      }>
      slots?: {
        required_slots: {
          origin: string
          destination: string
          departureDate: string
        }
        optional_slots?: {
          origin2: string
          destination2: string
          departureDate2: string
        }
      }
      categoryLabel: string
    }>
  }
}
