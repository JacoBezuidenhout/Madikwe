#define Gas 0
#define Solenoid 1
#define Alarm 2
#define PSensorPin 3
#define GSensorPin 4

int thP = 950;
int thGas = 900;
void setup() 
{
  pinMode(Solenoid,OUTPUT);
}


void loop() 
{
  int value = analogRead(PSensorPin);
  if (value > thP)
  {
    digitalWrite(Gas, HIGH);
    if (analogRead(GSensorPin) > thGas)
    {
      digitalWrite(Solenoid, HIGH);
      digitalWrite(Alarm, HIGH);
    }
    else
    {
      digitalWrite(Solenoid, LOW);
      digitalWrite(Alarm, LOW);
    }

  }
  else
  {  
    digitalWrite(Gas, LOW);
  } 
}