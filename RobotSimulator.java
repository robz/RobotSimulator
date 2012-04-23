import javax.swing.*;	
import java.awt.*;	
import java.awt.event.*;

public class RobotSimulator
{
	final static double PI = Math.PI;
	final static int KEY_d = 68, KEY_e = 69, KEY_f = 70, KEY_r = 82;
	final static double W_INC = .1;
	final static int SIZEX = 1200, SIZEY = 800;
	
	static class State
	{
		double x, y, theta, d;
	
		public State(double x, double y, double theta, double d) {
			this.x = x;
			this.y = y;
			this.theta = theta;
			this.d = d;
		}
		
		private double sin(double val) { return Math.sin(val); }
		private double cos(double val) { return Math.cos(val); }
		
		public void update(double w1, double w2) {
			double x2 = x, y2 = y, theta2 = theta;
			
			if(w1 == w2) {
				x2 = x + w1*cos(theta);
				y2 = y + w1*sin(theta);
				theta2 = theta;
			} else if (w1 > w2 && w2 >= 0) {
				double phi = (w1-w2)/d,
					r = d*(w1+w2)/(2*(w1-w2));
				x2 = x + r*( sin(theta) + sin(phi-theta) );
				y2 = y + r*( -cos(theta) + cos(theta-phi) );
				theta2 = theta - phi;
			} else if (w2 > w1 && w1 >= 0) {
				double phi = (w2-w1)/d,
					r = d*(w1+w2)/(2*(w2-w1));
				x2 = x + r*( -sin(theta) + sin(theta+phi) );
				y2 = y + r*( cos(theta) - cos(theta+phi) );
				theta2 = theta + phi;
			} else if (w1 < w2 && w2 <= 0) {
				w1 = Math.abs(w1);
				w2 = Math.abs(w2);
				double phi = (w1-w2)/d,
					r = d*(w1+w2)/(2*(w1-w2));
				x2 = x + r*( sin(theta) - sin(theta+phi) );
				y2 = y + r*( -cos(theta) + cos(theta+phi) );
				theta2 = theta + phi;
			} else if (w2 < w1 && w1 <= 0) {
				w1 = Math.abs(w1);
				w2 = Math.abs(w2);
				double phi = (w2-w1)/d,
					r = d*(w1+w2)/(2*(w2-w1));
				x2 = x + r*( -sin(theta) + sin(theta-phi) );
				y2 = y + r*( cos(theta) - cos(theta-phi) );
				theta2 = theta - phi;
			} else if (w1 > 0 && w2 < 0 && Math.abs(w1) >= Math.abs(w2)) {
				w2 = Math.abs(w2);
				double phi = (w1+w2)/d,
					z = d*(w1-w2)/(2*(w1+w2));
				x2 = x + z*( sin(theta) - sin(theta-phi) );
				y2 = y + z*( -cos(theta) + cos(theta-phi) );
				theta2 = theta - phi;
			} else if (w1 < 0 && w2 > 0 && Math.abs(w2) >= Math.abs(w1)) {
				w1 = Math.abs(w1);
				double phi = (w1+w2)/d,
					z = d*(w2-w1)/(2*(w1+w2));
				x2 = x + z*( -sin(theta) + sin(theta+phi) );
				y2 = y + z*( cos(theta) - cos(theta+phi) );
				theta2 = theta+phi;
			} else if (w1 > 0 && w2 < 0 && Math.abs(w1) <= Math.abs(w2)) {
				w2 = Math.abs(w2);
				double phi = (w1+w2)/d,
					z = d*(w1-w2)/(2*(w1+w2));
				x2 = x + z*( sin(theta) - sin(theta-phi) );
				y2 = y + z*( -cos(theta) + cos(theta-phi) );
				theta2 = theta-phi;
			} else if (w1 < 0 && w2 > 0 && Math.abs(w2) <= Math.abs(w1)) {
				w1 = Math.abs(w1);
				double phi = (w1+w2)/d,
					z = d*(w2-w1)/(2*(w1+w2));
				x2 = x + z*( -sin(theta) + sin(theta+phi) );
				y2 = y + z*( cos(theta) - cos(theta+phi) );
				theta2 = theta + phi;
			} else {
				System.out.println("ERROR: "+w1+","+w2);
				while(true);
			}
			
			x = x2;
			y = y2;
			theta = theta2;
		}
		
		// returns {xa,ya,xb,yb,x,y}
		public double[] getVals() {
			return new double[]{
				x - (d/2.0)*sin(theta),
				y + (d/2.0)*cos(theta),
				x + (d/2.0)*sin(theta),
				y - (d/2.0)*cos(theta),
				x + (d/2.0)*cos(theta),
				y + (d/2.0)*sin(theta),
				x, y, d};
		}
		
		public String toString() {
			double x_approx = Math.round(x*10000)/10000.0,
				y_approx = Math.round(y*10000)/10000.0,
				theta_approx = Math.round(theta*10000)/10000.0;
			return "("+x_approx+","+y_approx+") ; "+theta_approx;
		}
	}

	public static void main(String[] args) {
		new Frame();
	}
	
	static class Frame extends JFrame {
		public Frame() {
			setContentPane(new Pane());
			pack();
			setVisible(true);
		}
	
		class Pane extends JPanel implements KeyListener {
			State state;
			double vel1, vel2;
		
			public Pane() {
				setPreferredSize(new Dimension(SIZEX,SIZEY));
				state = new State(SIZEX/2,SIZEY/2,0,SIZEY/10);
				
				vel1 = 0; 
				vel2 = 0;
				
				new Renderer().start();
				new Updater().start();
				
				setFocusable(true);
				addKeyListener(this);
			}
			
			public void keyPressed(KeyEvent e) {
				int key = e.getKeyCode();
				double nvel1 = vel1, nvel2 = vel2;
				if (key == KEY_r) {
					if (vel1 < W_INC*10)
						nvel1 += W_INC;
				} else if (key == KEY_f) {
					if (vel1 > -W_INC*10)
						nvel1 -= W_INC;
				} else if (key == KEY_e) {
					if (vel2 < W_INC*10)
						nvel2 += W_INC;
				} else if (key == KEY_d) {
					if (vel2 > -W_INC*10)
						nvel2 -= W_INC;
				} 
				vel1 = Math.round(nvel1*10000)/10000.0;
				vel2 = Math.round(nvel2*10000)/10000.0;
				//System.out.println("changing velocities: "+vel1+","+vel2);
			}
			
			public void keyReleased(KeyEvent e) {}
			
			public void keyTyped(KeyEvent e) {}
			
			public void paint(Graphics g) {
				super.paint(g);
				//System.out.println("painting "+state.toString());
				
    			Graphics2D g2 = (Graphics2D) g;
    			
    			int[] vals = roundVals(state.getVals());
    			
    			g2.setColor(Color.lightGray);
				for(int r = 0; r < 20; r++) 
					g2.drawLine(0, r*(SIZEY/20), SIZEX, r*(SIZEY/20));
				for(int c = 0; c < 20; c++) 
					g2.drawLine(c*(SIZEX/20), 0, c*(SIZEX/20), SIZEY);
    			
    			g2.setColor(Color.black);
    			g2.setStroke(new BasicStroke(3));
				g2.drawLine(vals[0],vals[1],vals[2],vals[3]);
				g2.drawLine(vals[6],vals[7],vals[4],vals[5]);
				g2.drawOval(vals[6]-vals[8]/2,vals[7]-vals[8]/2,vals[8],vals[8]);
				g2.drawString("motor 1: "+vel1,5,20);	
				g2.drawString("motor 2: "+vel2,5,35);	
  			}
  			
  			private int[] roundVals(double[] vals) {
  				int[] intvals = new int[vals.length];
  				for(int i = 0; i < vals.length; i++) {
  					intvals[i] = (int)Math.round(vals[i]);
  				}
  				return intvals;
  			}
  			
  			class Updater extends Thread {
  				public void run() {
  					while(true) {
  						//System.out.println("updating!");
    					if (vel1 != 0 || vel2 != 0) 
    						state.update(vel1*2,vel2*2);
    					try{sleep(20);}catch(Exception e){}
  					}
  				}
  			}
  			
  			class Renderer extends Thread {
  				public void run() {
  					while(true) {
  						//System.out.println("rendering!");
  						repaint();
  						try{sleep(17);}catch(Exception e){}
  					}
  				}
  			}
		}
	}
}