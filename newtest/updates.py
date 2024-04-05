import json
import time
import random
from datetime import datetime

z = range(0,8)

status = ["SUCCESS", "FAILURE"]



def theLoop():
    

    for x in z:

        r = status[random.randint(0, 1)]

        print (r)
        current_date = datetime.now()
        
        #print(current_date.isoformat())

        f = open("./resource/NL.json","r")

        #print("opening file")
        data = json.loads(f.read())
        
        data["serverhost1"]["Connect Check"]["info"]["status"] = r
        f.close()
        #print("done")

        #print("writing file")
        with open("./resource/serverhost1.json", 'w') as fp:
            json.dump(data, fp)
            fp.close
        #print("done")

        #print(x, " sleeping")
        time.sleep(3)
        #theLoop()
    print("exit")

theLoop()
