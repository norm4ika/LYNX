'use client'

import { Check, Star } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'საწყისი',
    price: '0',
    currency: '₾',
    period: '/თვეში',
    description: 'პერფექტურია ტესტირებისთვის',
    features: [
      '5 რეკლამა თვეში',
      'საწყისი ტემპლატები',
      'სტანდარტული რეზოლუცია',
      'ელ-ფოსტის მხარდაჭერა'
    ],
    popular: false,
    cta: 'დაიწყეთ უფასოდ',
    href: '/signup'
  },
  {
    name: 'პროფესიონალი',
    price: '29',
    currency: '₾',
    period: '/თვეში',
    description: 'ყველაზე პოპულარული გეგმა',
    features: [
      '50 რეკლამა თვეში',
      'ყველა ტემპლატი',
      'მაღალი რეზოლუცია',
      'პრიორიტეტული მხარდაჭერა',
      'API წვდომა',
      'ბრენდინგის ხელსაწყოები'
    ],
    popular: true,
    cta: 'დაიწყეთ უფასო ტრიალი',
    href: '/signup'
  },
  {
    name: 'ბიზნესი',
    price: '99',
    currency: '₾',
    period: '/თვეში',
    description: 'დიდი ბიზნესებისთვის',
    features: [
      'ულიმიტო რეკლამა',
      'ყველა ტემპლატი',
      'უმაღლესი რეზოლუცია',
      '24/7 მხარდაჭერა',
      'API წვდომა',
      'ბრენდინგის ხელსაწყოები',
      'პრიორიტეტული დამუშავება',
      'კონსულტაცია'
    ],
    popular: false,
    cta: 'დაგვიკავშირდით',
    href: '/contact'
  }
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            აირჩიეთ თქვენი გეგმა
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ჩვენ გვაქვს სრულყოფილი გეგმები ყველა ზომის ბიზნესისთვის. 
            დაიწყეთ უფასოდ და განვითარდით ჩვენთან ერთად.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-card rounded-2xl border-2 p-8 ${
                plan.popular 
                  ? 'border-primary shadow-2xl shadow-primary/20' 
                  : 'border-border hover:border-primary/50 transition-colors'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>პოპულარული</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-2xl text-muted-foreground">{plan.currency}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground mb-4">ფუნქციები:</h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            ხშირად დასმული კითხვები
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                შემიძლია გეგმის შეცვლა?
              </h3>
              <p className="text-muted-foreground">
                დიახ, შეგიძლიათ ნებისმიერ დროს შეცვალოთ თქვენი გეგმა. 
                ცვლილებები ძალაში შევა მომდევნო ბილინგის ციკლში.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                არის უფასო ტრიალი?
              </h3>
              <p className="text-muted-foreground">
                დიახ, ყველა გეგმას აქვს 7-დღიანი უფასო ტრიალი. 
                არ გჭირდებათ საკრედიტო ბარათი დასაწყისისთვის.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                რა ფორმატებს ვმხარდავთ?
              </h3>
              <p className="text-muted-foreground">
                ვმხარდავთ JPG, PNG, WEBP ფორმატებს. 
                მაქსიმალური ფაილის ზომაა 10MB.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                რამდენი ხანი სჭირდება დამუშავებას?
              </h3>
              <p className="text-muted-foreground">
                ჩვეულებრივ 2-5 წუთი სჭირდება ერთი რეკლამის დამუშავებას. 
                პრემიუმ გეგმებს აქვთ პრიორიტეტული დამუშავება.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
